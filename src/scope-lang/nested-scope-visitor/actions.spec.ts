import * as _ from "lodash";
import { toAst as toAstVisitor } from "./actions-visitor";
import { displayJson } from "../util";
// const context = describe;

describe("Scope Visitor", () => {
  it.only("Can convert to AST with position info", () => {
    const inputText = "a=1";
    const astPos = toAstVisitor(inputText, { positioned: true });
    // console.log(displayJson(astPos));
    const stm1 = astPos[0];

    expect(stm1).toEqual({
      type: "ASSIGNMENT",
      variableName: "a",
      valueAssigned: "1",
      position: {
        startOffset: 1,
        endOffset: 1,
        startLine: 1,
        endLine: 1,
        startColumn: 2,
        endColumn: 2
      }
    });
  });

  it("Can convert a single assignment to an AST", () => {
    const inputText = "a=1";
    const ast = toAstVisitor(inputText);
    const stm1 = ast[0];

    expect(stm1).toEqual({
      type: "ASSIGNMENT",
      variableName: "a",
      valueAssigned: "1"
    });
  });

  it("single scope", () => {
    const inputText = "{ b=2 }";
    const ast = toAstVisitor(inputText);
    const stm1 = ast[0];

    expect(stm1).toEqual({
      type: "SCOPE",
      statements: [
        {
          type: "ASSIGNMENT",
          variableName: "b",
          valueAssigned: "2"
        }
      ]
    });
  });

  it("nested scope", () => {
    const inputText = "a=1 { b=2 { c=3 } d=4 }";
    const ast = toAstVisitor(inputText);
    const stm1 = ast[0];
    const stm2 = ast[1];

    expect(stm1).toEqual({
      type: "ASSIGNMENT",
      variableName: "a",
      valueAssigned: "1"
    });

    expect(stm2).toEqual({
      type: "SCOPE",
      statements: [
        {
          type: "ASSIGNMENT",
          variableName: "b",
          valueAssigned: "2"
        },
        {
          type: "SCOPE",
          statements: [
            {
              type: "ASSIGNMENT",
              variableName: "c",
              valueAssigned: "3"
            }
          ]
        }
      ]
    });
  });
});
