import * as _ from "lodash";
import { ScopeStackBuilder } from "./scope-stack-builder";
import { displayJson } from "../util";
import { toAst as toAstVisitor } from "../nested-scope-visitor/actions-visitor";
// import { scopeTree } from "./scope-tree";
const context = describe;

const inputText = "{ b=2 { c=3 } d=4 }";
const scopeTree = toAstVisitor(inputText, { positioned: true });
// console.log(displayJson(scopeTree));

const builder = new ScopeStackBuilder();

describe("Scope stack ", () => {
  // CR: only perform logic calls inside it/before in the describe it would be called before the test case is actuall run.
  const scopedAst: any = builder.build(scopeTree);
  // const { statements } = scopedAst;
  const ctx = scopedAst;
  // console.log(displayJson(scopedAst));
  const stm1 = ctx[0];
  const stm2 = ctx[1];
  const stm3 = ctx[2];

  // CR: strange to split the assertions into 3 parts because they all check the result of a
  // **single** invocation of the Scope Builder.
  // If there are three `it` I would expect 3 different inputs for the scope builder.
  it.only("statement 1", () => {
    // console.log({ stm1 });
    expect(stm1.varsAvailable).toEqual(["b"]);
  });

  it("statement 2", () => {
    // console.log("stm2", displayJson(stm2));
    const nested1 = stm2.statements[0];
    // console.log("nested1", displayJson(nested1));
    expect(nested1.varsAvailable).toEqual(["b", "c"]);
  });

  it("statement 3", () => {
    // console.log("stm3", displayJson(stm3));
    const nested2 = stm3.statements[0];
    expect(nested2.varsAvailable).toEqual(["b", "d"]);
  });
});
