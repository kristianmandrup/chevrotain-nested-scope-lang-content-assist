type TextDocumentPositionParams = {
  textDocument: {
    uri: "x";
  };
  position: any;
};
type CompletionItem = any;
enum CompletionItemKind {
  Reference,
  Text
}

const documents = {
  get: (_: any) => ({
    getText: (): string => "x"
  })
};

const onCompletion = (
  textDocumentPosition: TextDocumentPositionParams
): CompletionItem[] => {
  let text = documents.get(textDocumentPosition.textDocument.uri).getText();
  let position = textDocumentPosition.position;
  const lines = text.split(/\r?\n/g);
  // const currentLine = lines[position.line];

  const varsWithinScope = ["a"];

  // use parsed model to lookup via position
  // return a list of auto complete suggestions (for = assignment)
  // must be array of CompletionItem (see below)
  return varsWithinScope.reduce(
    (acc, varName) =>
      acc.concat({
        label: varName,
        kind: CompletionItemKind.Reference,
        data: varName
      }),
    [] as any
  );
};
