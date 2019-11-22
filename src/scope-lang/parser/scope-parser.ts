import { CstParser } from "chevrotain";
import { tokenVocabulary } from "../lexer";

// individual imports, prefer ES6 imports if supported in your runtime/transpiler...
const {
  // Var,
  BeginScope,
  EndScope,
  Assign,
  Identifier,
  Integer,
  Comma // CR: COMMA is not used, perhaps we do not need it at all?
} = tokenVocabulary;

export class ScopeParser extends CstParser {
  constructor() {
    super(tokenVocabulary);
    this.createRules();
  }

  // CR: This looks like JavaScript style Parser definition.
  // In TypeScript we can use a (better?) pattern where each parse rule is a class field.
  // https://github.com/SAP/chevrotain/blob/master/examples/implementation_languages/typescript/typescript_json.ts
  // This style will also be relevant using ECMAScript in the future: https://github.com/tc39/proposal-class-fields
  createRules() {
    // for conciseness
    const $: any = this;

    $.RULE("statements", () => {
      $.AT_LEAST_ONE({
        DEF: () => { // CR: no need for explicit DEF if there is no GATE, can just pass the function directly
          $.SUBRULE($.statement);
        }
      });
    });

    $.RULE("assignment", () => {
      // $.CONSUME(Var);
      $.CONSUME(Identifier);
      $.CONSUME(Assign);
      $.SUBRULE($.reference);
    });

    $.RULE("scope", () => {
      $.CONSUME(BeginScope);
      $.AT_LEAST_ONE({
        DEF: () => { // CR: no need for explicit DEF if there is no GATE, can just pass the function directly
          $.SUBRULE($.statement);
        }
      });
      $.CONSUME(EndScope);
    });

    // The "rhs" and "lhs" (Right/Left Hand Side) labels will provide easy
    // to use names during CST Visitor (step 3a).
    $.RULE("statement", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.assignment) },
        { ALT: () => $.SUBRULE($.scope) }
      ]);
    });

    $.RULE("reference", () => {
      $.OR([
        { ALT: () => $.CONSUME(Integer) },
        { ALT: () => $.CONSUME(Identifier) }
      ]);
    });

    // very important to call this after all the rules have been defined.
    // otherwise the parser may not work correctly as it will lack information
    // derived during the self analysis phase.
    this.performSelfAnalysis();
  }
}

// We only ever need one as the parser internal state is reset for each new input.
export const parserInstance: any = new ScopeParser();
