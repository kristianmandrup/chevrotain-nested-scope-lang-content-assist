import { lex } from "../lexer";
import { parserInstance } from "./scope-parser";
export { ScopeParser } from "./scope-parser";
export { parserInstance };

export const parse = (inputText: string) => {
  const lexResult = lex(inputText);

  // ".input" is a setter which will reset the parser's internal's state.
  parserInstance.input = lexResult.tokens;

  // No semantic actions so this won't return anything yet.
  parserInstance.selectStatement();

  if (parserInstance.errors.length > 0) {
    throw Error(
      "Sad sad panda, parsing errors detected!\n" +
        parserInstance.errors[0].message
    );
  }
};
