import { lineMap } from "./test-data";
import { displayJson } from "../util";
// const context = describe;
import { createIndexMatcher } from "./index-matcher";

describe("Scope Visitor", () => {
  it.only("Can convert to AST with position info", () => {
    // const inputText = "{ b = }";
    const position = {
      line: 1,
      column: 5
    };
    const findAssignmentNode = createIndexMatcher(lineMap, "assignment");
    const { data, column } = findAssignmentNode(position);
    const { varsAvailable } = data;
    console.log({ position, varsAvailable });
    expect(column).toEqual(4);
    expect(varsAvailable).toEqual(["b"]);
  });
});
