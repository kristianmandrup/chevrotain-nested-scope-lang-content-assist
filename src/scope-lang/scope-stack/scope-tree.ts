export const scopeTree = {
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
    },
    {
      type: "SCOPE",
      statements: [
        {
          type: "ASSIGNMENT",
          variableName: "d",
          valueAssigned: "4"
        }
      ]
    }
  ]
};
