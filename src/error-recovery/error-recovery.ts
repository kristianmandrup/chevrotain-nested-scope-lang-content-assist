import { createToken, CstParser, Lexer } from "chevrotain";

// ----------------- lexer -----------------

export const tokenMap = {
  True: createToken({ name: "True", pattern: /true/ }),
  False: createToken({ name: "False", pattern: /false/ }),
  Null: createToken({ name: "Null", pattern: /null/ }),
  LCurly: createToken({ name: "LCurly", pattern: /{/ }),
  RCurly: createToken({ name: "RCurly", pattern: /}/ }),
  LSquare: createToken({ name: "LSquare", pattern: /\[/ }),
  RSquare: createToken({ name: "RSquare", pattern: /]/ }),
  Comma: createToken({ name: "Comma", pattern: /,/ }),
  Colon: createToken({ name: "Colon", pattern: /:/ }),
  StringLiteral: createToken({
    name: "StringLiteral",
    pattern: /"(?:[^\\"]|\\(?:[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/
  }),
  NumberLiteral: createToken({
    name: "NumberLiteral",
    pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/
  }),
  WhiteSpace: createToken({
    name: "WhiteSpace",
    pattern: /\s+/,
    group: Lexer.SKIPPED
  })
};

const allTokens = [
  tokenMap.WhiteSpace,
  tokenMap.NumberLiteral,
  tokenMap.StringLiteral,
  tokenMap.LCurly,
  tokenMap.RCurly,
  tokenMap.LSquare,
  tokenMap.RSquare,
  tokenMap.Comma,
  tokenMap.Colon,
  tokenMap.True,
  tokenMap.False,
  tokenMap.Null
];

const JsonLexer = new Lexer(allTokens, {
  // Less verbose tokens will make the test's assertions easier to understand
  positionTracking: "onlyOffset"
});

// ----------------- parser -----------------
const MyCstParser: any = CstParser;

class JsonParser extends MyCstParser {
  constructor() {
    super(allTokens, {
      // by default the error recovery / fault tolerance capabilities are disabled
      recoveryEnabled: true
    });

    // not mandatory, using <$> (or any other sign) to reduce verbosity (this. this. this. this. .......)
    const $ = this;

    this.RULE("json", () => {
      // prettier-ignore
      $.OR([
                {ALT: () => {$.SUBRULE($.object)}},
                {ALT: () => {$.SUBRULE($.array)}}
            ])
    });

    this.RULE("object", () => {
      $.CONSUME(tokenMap.LCurly);
      $.OPTION(() => {
        $.SUBRULE($.objectItem);
        $.MANY(() => {
          $.CONSUME(tokenMap.Comma);
          $.SUBRULE2($.objectItem);
        });
      });
      $.CONSUME(tokenMap.RCurly);
    });

    this.RULE("objectItem", () => {
      $.CONSUME(tokenMap.StringLiteral);
      $.CONSUME(tokenMap.Colon);
      $.SUBRULE($.value);
    });

    this.RULE("array", () => {
      $.CONSUME(tokenMap.LSquare);
      $.OPTION(() => {
        $.SUBRULE($.value);
        $.MANY(() => {
          $.CONSUME(tokenMap.Comma);
          $.SUBRULE2($.value);
        });
      });
      $.CONSUME(tokenMap.RSquare);
    });

    this.RULE("value", () => {
      // prettier-ignore
      $.OR([
                {ALT: () => {$.CONSUME(tokenMap.StringLiteral)}},
                {ALT: () => {$.CONSUME(tokenMap.NumberLiteral)}},
                {ALT: () => {$.SUBRULE($.object)}},
                {ALT: () => {$.SUBRULE($.array)}},
                {ALT: () => {$.CONSUME(tokenMap.True)}},
                {ALT: () => {$.CONSUME(tokenMap.False)}},
                {ALT: () => {$.CONSUME(tokenMap.Null)}}
            ])
    });

    // very important to call this after all the rules have been defined.
    // otherwise the parser may not work correctly as it will lack information
    // derived during the self analysis phase.
    this.performSelfAnalysis();
  }
}

// reuse the same parser instance.
const parser: any = new JsonParser();

// ----------------- wrapping it all together -----------------

export const parse = (text: string) => {
  const lexResult = JsonLexer.tokenize(text);

  // setting a new input will RESET the parser instance's state.
  parser.input = lexResult.tokens;

  // any top level rule may be used as an entry point
  const cst = parser.json();

  return {
    cst: cst,
    lexErrors: lexResult.errors,
    parseErrors: parser.errors
  };
};
