export const relevantVarsWithinScope = (
  position: any,
  { find, lines }: any
) => {
  const { data, column } = find.assignment(position);

  const line = lines[position.line];
  const wordBeingTypedAfterAssignToken = line
    .slice(column + 1, position.character)
    .trim();

  const filterVars = varsWithinScope =>
    varsWithinScope.filter(varName =>
      varName.startsWith(wordBeingTypedAfterAssignToken)
    );

  const isTypingVarName = wordBeingTypedAfterAssignToken.length > 0;

  const varsWithinScope = data.varsAvailable;

  // if we are typing a (variable) name ref
  // - display var names that start with typed name
  // - otherwise display all var names in scope
  return isTypingVarName ? filterVars(varsWithinScope) : varsWithinScope;
};
