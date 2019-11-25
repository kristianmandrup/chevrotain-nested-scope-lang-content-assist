import { onChange } from "./on-change";

const getCompletionFnFor = lastChar => pos => {
  return [
    {
      // CompletionItem
    }
  ];
};

export const onCompletion = (
  textDocumentPosition: TextDocumentPositionParams
): CompletionItem[] => {
  const { find } = onChange(textDocumentPosition);

  // position has character and line position
  let text = documents.get(textDocumentPosition.textDocument.uri).getText();
  let position = textDocumentPosition.position;
  const lines = text.split(/\r?\n/g);
  const line = lines[position.line];

  // determine char just before position
  const lastCharLinePos = Math.min(0, position.character - 1);
  const lastTypedChar = line.charAt(lastCharLinePos);

  // map different completion functions for = and _
  const completionFn = getCompletionFnFor(lastTypedChar);

  // TODO: execute completion function for last char typed that triggered it

  const pos = {
    line: position.line,
    column: position.character
  };

  let assignmentValue = "xyz..."; // see solution below

  // return a list of auto complete suggestions (for = assignment)
  const { data, column } = find.assignment(pos, assignmentValue);
  const varsWithinScope = data.varsAvailable;
  let completionItems = new Array<CompletionItem>();

  // build completion items list
  varsWithinScope.map(varName =>
    completionItems.push({
      label: varName,
      kind: CompletionItemKind.Reference,
      data: varName
    })
  );
  return completionItems;
};
