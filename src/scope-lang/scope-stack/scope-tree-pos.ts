export const scopeTree = [
  {
    type: "SCOPE",
    statements: [
      {
        type: "ASSIGNMENT",
        variableName: "b",
        valueAssigned: "2",
        position: {
          startOffset: 3,
          endOffset: 3,
          startLine: 1,
          endLine: 1,
          startColumn: 4,
          endColumn: 4
        },
        varsAvailable: ["b"]
      },
      {
        type: "SCOPE",
        statements: [
          {
            type: "ASSIGNMENT",
            variableName: "c",
            valueAssigned: "3",
            position: {
              startOffset: 9,
              endOffset: 9,
              startLine: 1,
              endLine: 1,
              startColumn: 10,
              endColumn: 10
            },
            varsAvailable: ["b", "c"]
          }
        ]
      },
      {
        type: "ASSIGNMENT",
        variableName: "d",
        valueAssigned: "4",
        position: {
          startOffset: 15,
          endOffset: 15,
          startLine: 1,
          endLine: 1,
          startColumn: 16,
          endColumn: 16
        },
        varsAvailable: ["b", "d"]
      }
    ]
  }
];
