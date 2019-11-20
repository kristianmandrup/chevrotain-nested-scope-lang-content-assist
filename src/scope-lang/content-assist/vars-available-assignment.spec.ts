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
    const node = findAssignmentNode(position);
    const { varsAvailable } = node;
    console.log({ position, varsAvailable });
    expect(varsAvailable).toEqual(["b"]);
  });
});
