import * as Lint from 'tslint';
import ts from 'typescript';
export declare class Rule extends Lint.Rules.AbstractRule {
    private parseDiagnosticMessage;
    private mkRuleFailure;
    private ignorePattern;
    constructor(options: any);
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[];
}
