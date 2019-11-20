import { selectLexer } from "./scope-lexer";
export { tokenVocabulary } from "./scope-lexer";
export { selectLexer };

export const lex = (inputText: string) => {
  const lexingResult = selectLexer.tokenize(inputText);

  if (lexingResult.errors.length > 0) {
    throw Error("Sad Sad Panda, lexing errors detected");
  }

  return lexingResult;
};
