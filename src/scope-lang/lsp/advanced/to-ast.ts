import { AstVisitor } from "../../nested-scope-visitor";
import { lex } from "../../lexer";
import * as parser from "../../parser";

const ScopeParser: any = parser.ScopeParser;
const parserInstance = new ScopeParser();

export const toAst = (inputText: string, opts = {}) => {
  const lexResult = lex(inputText);

  const toAstVisitorInstance: any = new AstVisitor(opts);

  // ".input" is a setter which will reset the parser's internal's state.
  parserInstance.input = lexResult.tokens;

  // Automatic CST created when parsing
  const cst = parserInstance.statements();

  if (parserInstance.errors.length > 0) {
    throw Error(
      "Sad sad panda, parsing errors detected!\n" +
        parserInstance.errors[0].message
    );
  }
  const ast = toAstVisitorInstance.visit(cst);
  // console.log("AST - visitor", ast);
  return ast;
};
