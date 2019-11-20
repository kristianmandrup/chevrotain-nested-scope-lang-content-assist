// Tutorial Step 3a:

// Adding Actions(semantics) to our grammar using a CST Visitor.

import { lex } from "../lexer";
// re-using the parser implemented in step two.
import * as parser from "../parser";

const ScopeParser: any = parser.ScopeParser;

// A new parser instance with CST output (enabled by default).
const parserInstance = new ScopeParser();
// The base visitor class can be accessed via the a parser instance.
const BaseVisitor: any = parserInstance.getBaseCstVisitorConstructor();

export class PositionVisitor extends BaseVisitor {
  positioned = false;

  constructor(opts: any = {}) {
    super();
    this.positioned = opts.positioned;
  }

  get isPositioned() {
    return Boolean(this.positioned);
  }

  $decorate(node, { token }) {
    return !token ? node : this.$decoratePosition(node, token);
  }

  $decoratePosition(node, token) {
    const { isPositioned } = this;
    if (isPositioned) {
      const {
        startOffset,
        endOffset,
        startLine,
        endLine,
        startColumn,
        endColumn
      } = token;
      const position = {
        startOffset,
        endOffset,
        startLine,
        endLine,
        startColumn,
        endColumn
      };

      // console.log({ position });
      node.position = position;

      //console.log("$decoratePosition", { token, name });
    }
    return node;
  }
}

export class AstVisitor extends PositionVisitor {
  constructor(opts) {
    super(opts);
    this.validateVisitor();
  }

  // "this.visit" can be used to visit none-terminals and will invoke the correct visit method for the CstNode passed.

  //  "this.visit" can work on either a CstNode or an Array of CstNodes.
  //  If an array is passed (ctx.fromClause is an array) it is equivalent
  //  to passing the first element of that array

  statements(ctx: any) {
    // console.log(ctx);
    // use map to visit all statements
    return ctx.statement.map(stm => this.visit(stm));
  }

  statement(ctx: any) {
    if (ctx.assignment) {
      return this.visit(ctx.assignment);
    } else {
      return this.visit(ctx.scope);
    }
  }

  scope(ctx: any) {
    // console.log("scope", ctx.statement);
    const statements = ctx.statement.map(stm => this.visit(stm));
    return {
      type: "SCOPE",
      statements
    };
  }

  assignment(ctx: any) {
    // console.log("assignment = ", ctx);
    const variableName = ctx.Identifier[0].image;

    // value assigned
    const valueAssigned = this.visit(ctx.reference);
    const node = {
      type: "ASSIGNMENT",
      variableName,
      valueAssigned
    };
    const assignToken = ctx.Assign[0];

    return this.$decorate(node, { token: assignToken });
  }

  // these two visitor methods will return a string.
  reference(ctx: any) {
    if (ctx.Integer) {
      return ctx.Integer[0].image;
    } else {
      return ctx.Identifier[0].image;
    }
  }
}

// Our visitor has no state, so a single instance is sufficient.

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
