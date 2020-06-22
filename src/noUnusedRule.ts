import * as path from 'path';
import * as Lint from 'tslint';
import ts from 'typescript';

class LintLanguageServiceHost implements ts.LanguageServiceHost {

  constructor(private sourceFile: ts.SourceFile) {
  }

  getScriptFileNames() {
    return [this.sourceFile.fileName]
  }

  getCompilationSettings() {
    return {}
  }

  getScriptVersion(fileName: string): string {
    return "0"
  }
  getScriptSnapshot(fileName: string): ts.IScriptSnapshot {
    return ts.ScriptSnapshot.fromString(this.sourceFile.text)
  }
  getCurrentDirectory(): string {
    return path.relative(process.cwd(), this.sourceFile.fileName)
  }
  getDefaultLibFileName(options: ts.CompilerOptions): string {
    return ""
  }
}

export class Rule extends Lint.Rules.AbstractRule {
  private parseDiagnosticMessage(message: string | ts.DiagnosticMessageChain) {
    if (typeof message !== "string") {
      return message.messageText
    } else {
      return message
    }
  }

  private mkRuleFailure(
    sourceFile: ts.SourceFile,
    diag: ts.DiagnosticWithLocation
  ) {
    return new Lint.RuleFailure(
      sourceFile,
      diag.start,
      diag.start + diag.length,
      this.parseDiagnosticMessage(diag.messageText),
      this.ruleName
    )
  }

  private ignorePattern: RegExp[]
  constructor(options) {
    super(options)

    const { ruleArguments: [{ 'ignore-pattern': ignorePattern }] } = options
    if(ignorePattern) {
      this.ignorePattern = [].concat(ignorePattern).map(str => new RegExp(str));
    }
  }

  apply(
    sourceFile: ts.SourceFile,
  ): Lint.RuleFailure[] {
    const service = ts.createLanguageService(new LintLanguageServiceHost(sourceFile))
    const diagnostics = service.getSuggestionDiagnostics(sourceFile.fileName)
    return diagnostics
      .filter(diag => {
        // TODO: skip _ prefix
        if (typeof diag.messageText === 'string') {
          var tmp;
          const varName = (tmp = diag.messageText.match(/'(\w*)'/)) && tmp[1]

          if (this.ignorePattern && this.ignorePattern.some(patt => patt.test(varName))) {
            return false
          }
        }

        return (
          // See https://github.com/Microsoft/TypeScript/blob/v2.9.2/src/compiler/diagnosticMessages.json
          // for error code descriptions
          diag.code === 6133 ||
          diag.code === 6138 ||
          diag.code === 6192 ||
          diag.code === 6196 ||
          diag.code === 6198 ||
          diag.code === 6199
        )
      })
      .map(_ => this.mkRuleFailure(sourceFile, _))
  }
}
