# Chevrotain Nested scope language with Content Assist

This example project aims to demonstrate how to build a [chevrotain](https://sap.github.io/chevrotain) based language (lexer, compiler etc) with nested scopes.

This involves building a scope stack with a symbol stack for each level in the stack. This can then be used for IDE/editor content assist, displaying a list valid variable references at a given point in the document.

## WIP

Please note that the `error-recovery` and `syntax` folder are currently only for reference until proper error recovery and syntax is developed for this Nested scope language (example).

## Tech

- [TypeScript](https://www.typescriptlang.org/)
- [Jest](jestjs.io)
- [chevrotain](https://sap.github.io/chevrotain)
- [Visual Studio language server](https://docs.microsoft.com/en-us/visualstudio/extensibility/language-server-protocol?view=vs-2019)

## Install

`$ npm install`

## Run tests

This project uses [Jest](jestjs.io) with [jest-extended](https://github.com/jest-community/jest-extended) for additional convenience expectations

`$ npx jest`

## Design

- lexer
- parser
- actions and AST
- scope builder
- indexed assignment nodes
- content assist using lookup in indexed assignment map (by position)
- error handling and recovery (TODO)

### Lexer

```ts
let inputText = "{ b = 2 }";
let lexingResult = lex(inputText);
const { tokens } = lexingResult;
```

### Parser

```ts
const inputText = "{ b = 2 }";
const result = parse(inputText);
```

Invalid input

```ts
let inputText = "{ %b = 2 ";
parse(inputText); // throws
```

### Actions

#### AST

Given an input of: `a=1`

The `AST` generated for both embedded and visitor actions looks like this:

```ts
{
  type: "ASSIGNMENT",
  variableName: "a",
  valueAssigned: "1",
  position: {
    startOffset: 1,
    endOffset: 1,
    startLine: 1,
    endLine: 1,
    startColumn: 2,
    endColumn: 2
  }
}
```

## Nested Scope example

The nested scope language example can be found in `src/scope-lang`.

It is intended as an example for how to work with nested scopes and provide content assist over LSP for an editor/IDE such as VS Code.

## Content Assist

- [chevrotain content assist example project](https://github.com/SAP/chevrotain/tree/master/examples/parser/content_assist) with specs.
- [Chevrotain Editor/LSP discussion](https://github.com/SAP/chevrotain/issues/921#issuecomment-555581552)
- [Visual Studio Language Server for dot language](https://tomassetti.me/language-server-dot-visual-studio/)

### Alibaba Quick Start guide to VSC plugins

- [Quick Start to VSCode Plug-Ins: Language Server Protocol (LSP)](https://www.alibabacloud.com/blog/595294?spm=a2c41.13494487.0.0)
- [Quick Start to VSCode Plug-ins: Write LSP Project from Scratch](https://www.alibabacloud.com/blog/quick-start-to-vscode-plug-ins-write-lsp-project-from-scratch_595297?spm=a2c65.11461447.0.0.2cdf773dJMMsar)
- [Quick Start to VSCode Plug-Ins: Code Completion](https://medium.com/dataseries/quick-start-to-vscode-plug-ins-code-completion-408b95f5b5a6)
- [Quick Start to VSCode Plug-Ins: LSP protocol initialization parameters](https://www.alibabacloud.com/blog/quick-start-to-vscode-plug-ins-lsp-protocol-initialization-parameters_595296?spm=a2c65.11461447.0.0.2cdf773dJMMsar)
- [Quick Start to VSCode Plug-Ins: Programming Language Extensions](https://www.alibabacloud.com/blog/quick-start-to-vscode-plug-ins-programming-language-extensions_595287?spm=a2c65.11461447.0.0.2cdf773dJMMsar)
- [Quick Start to VSCode Plug-Ins: Diagnostic Information](https://www.alibabacloud.com/blog/quick-start-to-vscode-plug-ins-diagnostic-information_595288?spm=a2c65.11461447.0.0.2cdf773dJMMsar)
- [Quick Start to VSCode Plug-Ins: Running Commands](https://www.alibabacloud.com/blog/quick-start-to-vscode-plug-ins-running-commands_595286?spm=a2c65.11461447.0.0.2cdf773dJMMsar)

To add the completion provider (aka "content assist) for a VSC extension

```js
connection.onInitialize((params): InitializeResult => {
  return {
    capabilities: {
      // ...
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ["="]
      },
      hoverProvider: true
    }
  };
});
```

Note: Much of the following code can be found in `scope/lang/lsp/advanced`

Sample `onCompletion` handler:

```ts
connection.onCompletion((textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
  let text = documents.get(textDocumentPosition.textDocument.uri).getText();
  let position = textDocumentPosition.position;
  const lines = text.split(/\r?\n/g);
  const currentLine = lines[position.line]

  // use parsed model to lookup via position
  // return a list of auto complete suggestions (for = assignment)
  // must be array of CompletionItem (see below)
  return results;
```

```ts
const assignmentIndex = {
  3: { varsAvailable: ["a"] },
  9: { varsAvailable: ["a, b"] },
  17: { varsAvailable: ["b", "c"] }
};
```

```ts
const toAst = (inputText: string, opts = {}) => {
  const lexResult = lex(inputText);

  const toAstVisitorInstance: any = new AstVisitor(opts);

  // ".input" is a setter which will reset the parser's internal's state.
  parserInstance.input = lexResult.tokens;

  // Automatic CST created when parsing
  const cst = parserInstance.statements();

  if (parserInstance.errors.length > 0) {
    throw Error(
      "Sad sad panda, parsing errors detected!\n" +
        parserInstance.errors[0].message
    );
  }
  const ast = toAstVisitorInstance.visit(cst);
  // console.log("AST - visitor", ast);
  return ast;
}

const onChange = (textDocumentPosition: TextDocumentPositionParams) => {
    let text = documents.get(textDocumentPosition.textDocument.uri).getText();
    const scopeTree = toAstVisitor(text, { positioned: true });

    // run scope builder
    const builder = new ScopeStackBuilder();
    builder.build(scopeTree);
    const { lineMap } = builder;
    // we should
    this.find = {
      assignment: createIndexMatcher(lineMap, "assignment");
    }
  };
};

const onCompletion = (textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
  // position has character and line position
  let text = documents.get(textDocumentPosition.textDocument.uri).getText();
  let position = textDocumentPosition.position;
  const lines = text.split(/\r?\n/g);
  const line = lines[position.line]

  // determine char just before position  
  const lastCharLinePos = Math.min(0, position.character -1)
  const lastTypedChar = line.charAt(lastCharLinePos)

  // map different completion functions for = and _
  completionFn = getCompletionFnFor(lastTypedChar)

  // TODO: execute completion function for last char typed that triggered it

  const pos = {
    line: position.line,
    column: position.character
  };

  let assignmentValue = 'xyz...' // see solution below

  // return a list of auto complete suggestions (for = assignment)
  const const { data, column } = this.find.assignment(pos, assignmentValue);
  const varsWithinScope = data.varsAvailable;
  let completionItems = new Array<CompletionItem>();

  // build completion items list
  varsWithinScope.map(varName => results.push({
    label: varName,
    kind: CompletionItemKind.Reference,
    data: varName
  }))
  return completionItems;
};
```

See [CompletionItemKind](https://docs.microsoft.com/en-us/dotnet/api/microsoft.visualstudio.languageserver.protocol.completionitemkind?view=visualstudiosdk-2019) enum (and more VS Code API documentation)

Imagine we add a trigger on `_` for a language using snake case for variable names.

```ts
completionProvider: {
  resolveProvider: true,
  triggerCharacters: ["=", "_"]
},
```

We could then use an AST? lookup to detect that we are in the middle of an assignment and are typing a name for the RHS (value/reference being assigned).

`var c = abc_`

We could use logic like the following to propose only var names that start with what we have typed so far.

```ts
const const { data, column } = this.find.assignment(pos);

const line = lines[position.line]
const wordBeingTypedAfterAssignToken = line.slice(column+1, position.character).trim()

const filterVars = (varsWithinScope) => varsWithinScope.filter(varName => varName.startsWith(wordBeingTypedAfterAssignToken))

const isTypingVarName = wordBeingTypedAfterAssignToken.length > 0

// if we are typing a (variable) name ref
// - display var names that start with typed name
// - otherwise display all var names in scope
const relevantVarsWithinScope = isTypingVarName ? filterVars(varsWithinScope) : varsWithinScope
```

### Named scopes

We could also use named scopes, similar to namespaces or modules/classes etc.

```ts
    $.RULE("scope", () => {
      $.CONSUME(Identifier); // named scopes
      $.CONSUME(BeginScope);
      $.AT_LEAST_ONE({
        DEF: () => {
          $.SUBRULE($.statement);
        }
      });
      $.CONSUME(EndScope);
    });
```

```ts
alpha {
  a = 2
}
```

Then we could generate the `varsAvailable` as a map instead, to indicate for which scope a particular variable is made available (reachable):

We could have the parser wrap the source code in a `global` namespace by convention

```ts
global {
  alpha {
    a = 2
  }
}
```

Then the simple solution would return `varsAvailable` as follows

```ts
varsAvailable = {
  a: {
    scope: 'alpha'
  },
  b: {
    scope: 'global'
  }
}
```

Scope names are hierarchical, so it would be better to reference the full nested scope name.

```ts
varsAvailable = {
  a: {
    scope: 'global.alpha'
  },
  b: {
    scope: 'global'
  }
}
```

This could be easily achieved by maintaining another scope stack `namedScopes` in the same fashion that `varsAvailable` are built, then joining the scope names by `.` to create the full scope name.

### Completion resolve

We can also add an `onCompletionResolve` handler as follows. This can be used to provide additional context and documentation for the option available to be selected.

```ts
connection.onCompletionResolve(
    (item: CompletionItem): CompletionItem => {
        item.detail = item.data;
        item.documentation = `${item.data} reference`;
        return item;
    }
)
```

## VS Code Language extension

See [VSC Language extension](./VSC-lang-extension.md)

### Editor/IDE utils

[chevrotain-editor-utils](https://github.com/kristianmandrup/chevrotain-editor-utils)

### Language Server utils

[chevrotain-lsp-utils](https://github.com/kristianmandrup/chevrotain-lsp-utils)
