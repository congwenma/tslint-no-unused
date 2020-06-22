"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const Lint = __importStar(require("tslint"));
const path = __importStar(require("path"));
class LintLanguageServiceHost {
    constructor(sourceFile) {
        this.sourceFile = sourceFile;
    }
    getScriptFileNames() {
        return [this.sourceFile.fileName];
    }
    getCompilationSettings() {
        return {};
    }
    getScriptVersion(fileName) {
        return "0";
    }
    getScriptSnapshot(fileName) {
        return typescript_1.default.ScriptSnapshot.fromString(this.sourceFile.text);
    }
    getCurrentDirectory() {
        return path.relative(process.cwd(), this.sourceFile.fileName);
    }
    getDefaultLibFileName(options) {
        return "";
    }
}
class Rule extends Lint.Rules.AbstractRule {
    parseDiagnosticMessage(message) {
        if (typeof message !== "string") {
            return message.messageText;
        }
        else {
            return message;
        }
    }
    mkRuleFailure(sourceFile, diag) {
        return new Lint.RuleFailure(sourceFile, diag.start, diag.start + diag.length, this.parseDiagnosticMessage(diag.messageText), this.ruleName);
    }
    apply(sourceFile) {
        const service = typescript_1.default.createLanguageService(new LintLanguageServiceHost(sourceFile));
        const diagnostics = service.getSuggestionDiagnostics(sourceFile.fileName);
        return diagnostics
            .filter(diag => {
            return (
            // See https://github.com/Microsoft/TypeScript/blob/v2.9.2/src/compiler/diagnosticMessages.json
            // for error code descriptions
            diag.code === 6133 ||
                diag.code === 6138 ||
                diag.code === 6192 ||
                diag.code === 6196 ||
                diag.code === 6198 ||
                diag.code === 6199);
        })
            .map(_ => this.mkRuleFailure(sourceFile, _));
    }
}
exports.Rule = Rule;
