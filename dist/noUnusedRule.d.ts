import ts from "typescript";
import * as Lint from "tslint";
export declare class Rule extends Lint.Rules.AbstractRule {
    private parseDiagnosticMessage;
    private mkRuleFailure;
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[];
}
