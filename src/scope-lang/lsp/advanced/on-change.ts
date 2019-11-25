import { createIndexMatcher } from "../../content-assist";
import { toAst } from "./to-ast";
import { ScopeStackBuilder } from "../../scope-stack/scope-stack-builder";

export const onChange = (textDocumentPosition: TextDocumentPositionParams) => {
  let text = documents.get(textDocumentPosition.textDocument.uri).getText();
  const scopeTree = toAst(text, { positioned: true });

  // run scope builder
  const builder = new ScopeStackBuilder();
  builder.build(scopeTree);
  const { lineMap } = builder;
  // we should
  const find = {
    assignment: createIndexMatcher(lineMap, "assignment")
  };

  return { find };
};
