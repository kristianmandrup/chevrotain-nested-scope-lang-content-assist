import { displayJson } from "../util";
import merge from "lodash.merge";

export class ScopeStackBuilder {
  symbolStack: any[] = [];
  lineMap: any = {};

  get typeHandlerMap() {
    return {
      SCOPE: "scope",
      ASSIGNMENT: "assignment"
    };
  }

  build(ast) {
    return this.evaluate(ast, null);
  }

  handlerFor(name: string) {
    return this.typeHandlerMap[name];
  }

  handle(stm: any) {
    const { type } = stm;
    const handlerName = this.handlerFor(type);
    if (!handlerName) {
      throw `Invalid type ${type}`;
    }
    const fn = this[handlerName];
    if (!fn) {
      throw `No such method ${handlerName}`;
    }
    const boundFn = fn.bind(this);
    return boundFn(stm);
  }

  get stackIndex() {
    return Math.max(0, this.symbolStack.length - 1);
  }

  get currentStackScope() {
    return this.symbolStack[this.stackIndex];
  }

  displaySymbolStack(variableName) {
    console.log(variableName, displayJson(this.symbolStack));
  }

  evaluate(statements: any[], ctx: any) {
    if (!statements) {
      // console.warn("no statements", displayJson(ctx));
      return;
    }
    return statements.map(stm => {
      const result = this.handle(stm);
      // console.log("handled stm", result);
      return {
        type: "STATEMENT",
        ...result
      };
    });
  }

  scope(ctx: any) {
    this.symbolStack.push({
      vars: []
    });

    const statements = this.evaluate(ctx.statements, ctx);
    this.symbolStack.pop();

    const node = ctx;
    if (statements) {
      node.statements = statements;
    }
    return node;
  }

  lineObjFor(lineNumber: number) {
    this.lineMap = this.lineMap || {};
    this.lineMap[lineNumber] = this.lineMap[lineNumber] || {};
    return this.lineMap[lineNumber];
  }

  setLineObj(lineNumber: number, obj: any) {
    let currObj = this.lineObjFor(lineNumber);
    const newObj = merge(currObj, obj);
    console.log("setLineObj", { newObj });
    this.lineMap[lineNumber] = newObj;
    console.log(displayJson(this.lineMap));
  }

  indexAssignment(position, node) {
    const { startColumn, startLine } = position;
    const assignObj = {
      [startColumn]: node
    };
    this.setLineObj(startLine, {
      assignment: assignObj
    });
  }

  assignment(ctx: any) {
    const { variableName, position } = ctx;
    // console.log("assignment =", ctx);
    const { currentStackScope, symbolStack } = this;
    // console.log({ currentStackScope, stackIndex, symbolStack });
    currentStackScope.vars.push(variableName);
    const varsAvailable = symbolStack.reduce((acc, item) => {
      return acc.concat(item.vars);
    }, []);

    const node = {
      ...ctx,
      varsAvailable
    };

    this.indexAssignment(position, node);

    // console.log({ varsAvailable });
    // this.displaySymbolStack(variableName);
    return node;
  }
}
