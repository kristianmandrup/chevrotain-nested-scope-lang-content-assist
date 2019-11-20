import { lineMap } from "./test-data";
import { displayJson } from "../util";
// const context = describe;
import { createIndexMatcher } from "./index-matcher";

describe("Scope Visitor", () => {
  it.only("Can convert to AST with position info", () => {
    // const inputText = "a_b = 1 { b = a_ }";
    const position = {
      line: 1,
      column: 5
    };
    const findAssignmentNode = createIndexMatcher(lineMap, "assignment");
    const { data, column } = findAssignmentNode(position, "a_");
    const { varsAvailable } = data;
    console.log({ position, varsAvailable });
    expect(column).toEqual(4);
    expect(varsAvailable).toEqual(["b"]);
  });
});
