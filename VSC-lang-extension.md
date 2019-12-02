# VSC Adding new language

See [Adding a New Language](https://vscode-docs.readthedocs.io/en/stable/customization/colorizer/#adding-a-new-language)

Using the [code Yeoman generator](https://vscode-docs.readthedocs.io/en/stable/tools/yocode/), you can add TextMate language specification files (.tmLanguage) to your VS Code installation to get syntax highlighting and bracket matching.

A good place to look for existing TextMate `.tmLanguage` files is on GitHub. Search for a _TextMate bundle_ for the language you are interested in and then navigate to the `syntaxes` folder. The 'code' Yeoman generator can handle either `.tmLanguage` or `.plist` files.

When prompted for the URL or file location, pass the raw path to the `.tmLanguage` file e.g. [syntaxes/Ant.tmLanguage](http://raw.githubusercontent.com/textmate/ant.tmbundle/master/Syntaxes/Ant.tmLanguage)

The generator will prompt you for other information such a unique name (this should be unique to avoid clashing with other customizations) and the language name, aliases and file extensions.

```bash
npm install -g yo generator-code
yo code
```

## New Language Support

Creates an extension that contributes a language with colorizer.

Prompts for the location (URL or file path) of an existing TextMate language file (`.tmLanguage`, `.plist` or `.json`). This file will be imported to the new extension

Prompts for the _extension identifier_ and will create a _folder_ of that _name_ in the current directory

Once created, open VS Code on the created folder and run the extension to test the colorization. Check out [VSC extension quickstart](https://github.com/kristianmandrup/app-ml-proj/blob/master/packages/extension/docs/Quickstart.md) for the next steps. Have a look at the language configuration file that has been created and defines configuration options such what style of comments and brackets the language uses

When the generator is finished, copy the complete output folder to a new folder under your `.vscode/extensions` folder and restart VS Code. When you restart VS Code, your new language will be visible in the language specifier dropdown and you'll get full colorization and bracket/tag matching for files matching the language's file extension.

### Loading an Extension

To load an extension, you need to copy the files to your VS Code extensions folder. We cover this in detail here: [Installing Extensions](https://vscode-docs.readthedocs.io/en/stable/extensions/install-extension/).

#### Your Extensions Folder

VS Code looks for extensions under your extensions folder `.vscode/extensions`. Depending on your platform it is located:

- Windows `%USERPROFILE%\.vscode\extensions`
- Mac `$HOME/.vscode/extensions`
- Linux `$HOME/.vscode/extensions`

If you want to load your extension or customization each time VS Code runs, copy your project to a new folder under `.vscode/extensions` ie. `$HOME/.vscode/extensions/myextension`

### Publishing extension to the Gallery

If you want to share your extension with others in the [Gallery](https://vscode-docs.readthedocs.io/en/stable/editor/extension-gallery/), you can use the [vsce](https://vscode-docs.readthedocs.io/en/stable/tools/vscecli/) publishing tool to package it up and submit it.

`npm install -g vsce`

Usage

You'll use the `vsce` command directly from the command line. For example, here's how you can quickly publish an extension:

```bash
$ vsce publish
Publishing uuid@0.0.1...
Successfully published uuid@0.0.1!
```

For a reference on all the available commands, run `vsce --help`.

## VS Code language definition

For a detailed overview and walkthrough:

- [outline](https://github.com/kristianmandrup/app-ml-proj/tree/master/packages/extension)
- [docs](https://github.com/kristianmandrup/app-ml-proj/tree/master/packages/extension/docs)

This library adds the following `contributes` entry to the `package.json` file.

The `languages` array entry under `contributes` defines what languages are contributed by this module. We will call the language `sqlx` with alias `sql`

- `id` is the unique identifier for the language
- `extensions` defines the which files are to be treated as an `sqlx` language file.
- `configuration` is a reference to the language configuration file, located in `./language-configuration.json` (see below).

```json
{
  "contributes": {
    "languages": [
      {
        "id": "sqlx",
        "aliases": ["sql"],
        "extensions": [".sqlx"],
        "configuration": "./language-configuration.json"
      }
    ],
    "grammars": [
      {
        "language": "sqlx",
        "scopeName": "source.sqlx",
        "path": "./syntaxes/sqlx.json"
      }
    ]
  }
}
```

### Grammars

- The code that matches the `sqlx` syntax will be marked as the scope `source.sqlx`. Note: a file can potentially have multiple (language) scopes.

The syntax for the language will be defined in `./syntaxes/sqlx.json`

### Language configuration

The language configuration will be found in `./language-configuration.json`.
In this file we define common language concepts such as:

- opening and closing braces
- brackets
- quotes
- comments
- ...

If you want to introduce a new comment or bracket type, the `language-configuration.json` is the file to do that.

```json
{
  "comments": {
    "lineComment": "//",
    "blockComment": ["/*", "*/"]
  },
  "brackets": [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"]
  ]
}
```

That’s it! With just these few configuration changes, you already have an extension that supports syntax highlighting!

See [language-configuration-guide](https://code.visualstudio.com/api/language-extensions/language-configuration-guide) for a more detailed guide

```json
{
	"comments": {
		"lineComment": "//",
		"blockComment": [ "/*", "*/" ]
	},
	"brackets": [
		["{", "}"],
		["[", "]"],
		["(", ")"]
	],
	"autoClosingPairs": [
		{ "open": "{", "close": "}" },
		{ "open": "[", "close": "]" },
		{ "open": "(", "close": ")" },
		{ "open": "'", "close": "'", "notIn": ["string", "comment"] },
		{ "open": "\"", "close": "\"", "notIn": ["string"] },
		{ "open": "`", "close": "`", "notIn": ["string", "comment"] },
		{ "open": "/**", "close": " */", "notIn": ["string"] }
	],
	"autoCloseBefore": ";:.,=}])>` \n\t",
	"surroundingPairs": [
		["{", "}"],
		["[", "]"],
		["(", ")"],
		["'", "'"],
		["\"", "\""],
		["`", "`"]
	],
	"folding": {
		"markers": {
			"start": "^\\s*//\\s*#?region\\b",
			"end": "^\\s*//\\s*#?endregion\\b"
		}
	},
	"wordPattern": "(-?\\d*\\.\\d\\w*)|([^\\`\\~\\!\\@\\#\\%\\^\\&\\*\\(\\)\\-\\=\\+\\[\\{\\]\\}\\\\\\|\\;\\:\\'\\\"\\,\\.\\<\\>\\/\\?\\s]+)",
	"indentationRules": {
		"increaseIndentPattern": "^((?!.*?\\/\\*).*\\*\/)?\\s*[\\}\\]].*$",
		"decreaseIndentPattern": "^((?!\\/\\/).)*(\\{[^}\"'`]*|\\([^)\"'`]*|\\[[^\\]\"'`]*)$"
	}
}
```

#### Writing grammars for the IDE/Editor

For how to write the `tmLanguage` file, see [Macromates language grammars](https://macromates.com/manual/en/language_grammars)

Alternatively you can write the an equivalent json file, such as demonstrated for [sqf](https://github.com/Armitxes/VSCode_SQF/blob/dc4c8b0f44fd969065ffedaf915687f2f062a4b1/syntaxes/sqf.json)

In the following we define the file type and name `sqlx`. The `scopeName` gives a name to all tokens (in any source file) covered by this grammar.

The `patterns` entry defines the patterns to recognize at the root level, here `#expression` which is a reference to the `expression` definition (in `repository`).

```json
{
  "fileTypes": ["sqlx"],
  "name": "sqlx",
  "patterns": [
    {
      "include": "#expression"
    }
  ],
  "scopeName": "source.sqf"
  // ...
}
```

The `expression` includes a list of patterns that all count as expression variants. This forms a rule hierarchy, matching the rules defined in your lexer/parser.

```json
"repository": {
  // ...
  "expression": {
      "name": "meta.expression.sqf",
      "patterns": [
          {
              "include": "#string"
          },
          {
              "include": "#comment"
          },
          {
              "include": "#literal"
          },
          {
              "include": "#paren-expression"
          },
          {
              "include": "#block"
          },
          // ...
      ]
  }
}
```

The `repository` defines a collection of constructs such as `array-literal` which can be referenced.

```json
"repository": {
  "assignment-operator": {
  },
  "block": {
    "begin": "\\{",
    "beginCaptures": {
      "0": {
          "name": "meta.brace.curly.sqf"
      }
    },
    "end": "\\}",
    "endCaptures": {
      "0": {
          "name": "meta.brace.curly.sqf"
      }
    },
    "name": "meta.block.sqf",
    "patterns": [
      {
          "include": "#expression"
      }
    ]
  },
  // ...
}
```

### Repository entries

- `name` - name of the full construct that spans from `begin` to `end`

#### match capture

The simplest language constructs can be defined using a simple `match` pattern
Any tokens matching this pattern will be marked by the value of `name`, here as `keyword.operator.assignment.sqf`

```json
"assignment-operator": {
    "match": "=",
    "name": "keyword.operator.assignment.sqf"
},
```

The match can also be more complex as demonstrated by `boolean-literal` which matches:

- `false`
- `true`

The preceding `(\\s*)` matches optional whitespace in front. The `\\b` is a [word boundary](https://www.regular-expressions.info/wordboundaries.html) marker.

Simply put: `\b` allows you to perform a "whole words only" search using a regular expression in the form of `\bword\b`. A "word character" is a character that can be used to form words. All characters that are not "word characters" are "non-word characters".

```json
"boolean-literal": {
    "match": "(\\s*)(false|true)\\b",
    "name": "constant.language.boolean.sqf"
},
```

In the `sqf.json` grammar we see, that the `\\b` end marker is used whenever we have the pattern matching form

- optional space
- or expression (alternatives)
- space required to separate from next construct following this one

#### begin to end capture

Syntax that marks a grouping or block, can be defined using begin and end marker patterns

The simplest form is demonstrated by the `comment-block` which simply gives a name `comment.block.sqf` to tokens within the begin and end markers.

```json
  "comment-block": {
      "begin": "/\\*",
      "end": "\\*/",
      "name": "comment.block.sqf"
  },
```

We see a more complex version for `array-literal`

- `begin` - pattern that marks the beginning of this construct `[`
- `beginCaptures` name of the marker for `[`
- `end` - pattern that marks the end of this construct `]`
- `endCaptures` name of the marker for `]`
- `patterns` what to match within the `begin` and `end` (ie. more expressions)

```json
"array-literal": {
    "begin": "\\[",
    "beginCaptures": {
        "0": {
            "name": "meta.brace.square.sqf"
        }
    },
    "end": "\\]",
    "endCaptures": {
        "0": {
            "name": "meta.brace.square.sqf"
        }
    },
    "name": "meta.array.literal.sqf",
    "patterns": [
        {
            "include": "#expression"
        }
    ]
},
```

Here the `block` construct, which allows for multiple different patterns within it:

- `expression` for regular blocks
- `object member` for objects

```json
      "block": {
          "begin": "\\{",
          "beginCaptures": {
              "0": {
                  "name": "meta.brace.curly.sqf"
              }
          },
          "end": "\\}",
          "endCaptures": {
              "0": {
                  "name": "meta.brace.curly.sqf"
              }
          },
          "name": "meta.block.sqf",
          "patterns": [
              {
                  "include": "#expression"
              },
              {
                  "include": "#object-member"
              }
          ]
      },
      // ... more repository definitions
  }
```

#### virtual (pattern alternatives - OR)

The comment grammar definition simple says that either of the patterns `comment-block` or `comment-line` is a `comment`

```json
  "comment": {
      "name": "comment.sqf",
      "patterns": [
          {
              "include": "#comment-block"
          },
          {
              "include": "#comment-line"
          }
      ]
  },
```

## Mini Sql syntax definition

The following is the syntax definition for the mini SQL language. Notice that the keys
for the `repository` entries match the rules in the SqlParser such as `atomic-expression` for `atomicExpression` and so on. Also notice that the patterns match the subrules for each rule.

```json
{
  "fileTypes": ["sqlx"],
  "name": "sqlx",
  "patterns": [
    {
      "include": "#expression"
    }
  ],
  "repository": {
    "atomic-expression": {
      "name": "meta.expression.atomic.sqlx",
      "patterns": [
        {
          "include": "#var-ref"
        },
        {
          "include": "#relational-operator"
        },
        {
          "include": "#numeric-literal"
        }
      ]
    },
    "var-ref": {
      "match": "(\\s*)(_+[a-zA-Z_0-9]+)",
      "name": "variable.other.private.sqlx"
    },
    "numeric-literal": {
      "match": "\\s*(?<=[^$])((0(x|X)[0-9a-fA-F]+)|([0-9]+(\\.[0-9]+)?))\\b",
      "name": "constant.numeric.sqf"
    },

    "select-clause": {
      "match": "\\s*(?i)(SELECT)\\b",
      "name": "keyword.select.sqlx",
      "patterns": [
        {
          "include": "#from"
        },
        {
          "include": "#where"
        }
      ]
    },
    "from": {
      "match": "\\s*(?i)(FROM)\\b",
      "name": "keyword.where.sqlx"
    },
    "where": {
      "match": "\\s*(?i)(WHERE)\\b",
      "name": "keyword.where.sqlx",
      "patterns": [
        {
          "include": "#atomic-expression"
        }
      ]
    },
    "relational-operator": {
      "match": "=",
      "name": "keyword.operator.assignment.sqlx"
    },
    "comment-line": {
      "match": "(#).*$\\n?",
      "name": "comment.line.sqlx"
    },
    "comment": {
      "name": "comment.sqf",
      "patterns": [
        {
          "include": "#comment-line"
        }
      ]
    },
    "expression": {
      "name": "meta.expression.sqlx",
      "patterns": [
        {
          "include": "#select"
        },
        {
          "include": "#comment"
        }
      ]
    }
  },
  "scopeName": "source.sqlx"
}
```

## Language Server Protocol (LSP)

- [Chevrotain Language Server guide issue](https://github.com/SAP/chevrotain/issues/921#)
- [LSP code example](https://github.com/kristianmandrup/app-ml-proj/tree/master/packages/lsp)
- [VSC Language Server extension guide](https://code.visualstudio.com/api/language-extensions/language-server-extension-guide)

To create an LSP project from scratch, use the yo `code` generator

`$ yo code`

Make sure you have a file structure as follows

```bash
.
├── client // Language Client
│   ├── src
│   │   ├── test // End to End tests for Language Client / Server
│   │   └── extension.ts // Language Client entry point
├── package.json // The extension manifest.
└── server // Language Server
    └── src
        └── server.ts // Language Server entry point
```

Resources:

- [VS code extension sample repo](https://github.com/Microsoft/vscode-extension-samples/tree/master/lsp-sample)
- [A Language Server For DOT With Visual Studio Code](https://tomassetti.me/language-server-dot-visual-studio/)
- [dot repo](https://github.com/unosviluppatore/language-server-dot)

Stardog LSP example (based on Chevrotain parsers)

- [stardog-language-utils](https://github.com/stardog-union/stardog-language-servers/tree/master/packages/stardog-language-utils)
- [millan - Stardog Parsers](https://github.com/stardog-union/millan#readme)

## Debugging Extension development

Add a `.vscode` folder with a `launch.json` file:

Clone [this repo](https://github.com/gctse/syntax-highlighting-VS-Code-example) and try!

```json
// A launch configuration that launches the extension inside a new window
{
  "version": "0.1.0",
  "configurations": [
    {
      "name": "Launch Extension",
      "type": "extensionHost",
      "request": "launch",
      "runtimeExecutable": "${execPath}",
      "args": ["--extensionDevelopmentPath=${workspaceRoot}"]
    }
  ]
}
```

### Conclusion

It should be possible to create a wrapper using a set of conventions, to make it easy to create the language configuration and grammar for VC Code directly from a Chevrotain lexer/parser definition using shared lookup maps that declaratively defines the basic language schematics.

Parser rules

```ts
$.RULE("fromClause", () => {
  $.CONSUME(From);
  $.CONSUME(Identifier);
});

$.RULE("whereClause", () => {
  $.CONSUME(Where);
  $.SUBRULE($.expression);
});
```

Tokens

```ts
const Identifier = createToken({
  name: "Identifier",
  pattern: /_+[a-zA-Z_0-9]+/
});
// ...
```

Syntax based on parser rules:

```json
{
  "var-ref": {
    "match": "(\\s*)(_+[a-zA-Z_0-9]+)",
    "name": "variable.other.private.sqlx"
  },
  "numeric-literal": {
    "match": "\\s*(?<=[^$])((0(x|X)[0-9a-fA-F]+)|([0-9]+(\\.[0-9]+)?))\\b",
    "name": "constant.numeric.sqf"
  },
  "control-statement": {
    "match": "\\s*(?i)(SELECT|FROM|WHERE)\\b",
    "name": "keyword.where.sqlx"
  },
  "expression": {
    "name": "meta.expression.sqlx",
    "patterns": [
      {
        "include": "#control-statement"
      },
      {
        "include": "#comment"
      },
      {
        "include": "#var-ref"
      },
      {
        "include": "#relational-operator"
      },
      {
        "include": "#numeric-literal"
      }
    ]
  }
  // ...
}
```

Perhaps we could have the parser build a model (as the api is used). The model can then be used to generate a syntax structure as output. This syntax output should be able to get the developer 90-95% of the way.

```ts
const tokenMap = createTokenMap({
  Identifier: { name: "Identifier", pattern: /[a-zA-Z]\w*/ },
  From: {
    name: "From",
    pattern: /FROM/,
    matches: "FROM",
    longer_alt: "#Identifier"
  },
  Where: {
    name: "Where",
    pattern: /WHERE/,
    matches: "WHERE",
    longer_alt: Identifier
  }
});
```

`createTokenMap` can be found in `utils/create-token-map`

Parser using `consumeStx`, `subruleStx` and `syntax` to generate a `SyntaxModel`

Note: In order for the syntax model to be generated, you will need to feed it a test document to parse which triggers all the rules that act to create the syntax model!

```ts
$.RULE("fromClause", () => {
  $.consumeStx("From", { type: "control-statement", matches: "From" });
  $.consumeStx("Identifier", { type: "var-ref", partOf: "expression" });
});

$.rule("whereClause", () => {
  $.consumeStx("Where", { type: "control-statement", matches: "Where" });
  $.SUBRULE($.expression);
});

$.rule("block", () => {
  const ctx = { type: "scope-block", block: true };
  const stxName = "meta.brace.curly";
  $.consumeStx("LBrace", { ...ctx, matches: "{", begin: stxName });
  $.subruleStx("expression", { ...ctx, matches: "expression" });
  $.consumeStx("RBrace", { ...ctx, matches: "}", end: stxName });
});

// could have default mapping using conventions, then allow overrides
// warn if no syntax mapping defined
$.syntax("expression", "meta.expression", {
  references: ["control-statement"],
  root: true
});
$.syntax("var-ref", "variable.other.private");
$.syntax("control-statement", "keyword.control");
// ...
```

The `block` rule should generate a syntax like:

```json
{
  "begin": "\\{",
  "beginCaptures": {
    "0": {
      "name": "meta.brace.curly.sqf"
    }
  },
  "end": "\\}",
  "endCaptures": {
    "0": {
      "name": "meta.brace.curly.sqf"
    }
  },
  "patterns": [
    {
      "include": "#expression"
    }
  ]
}
```

The syntax model wrappers

```ts
consumeStx = (tokenRef, opts = {}) => {
  this.CONSUME(this.tokenFor(tokenRef));
  this.addToModel(tokenRef, opts);
};

addToModel = (tokenRef, opts) => {
  let { type, matches, partOf } = opts;

  const typeEntry = {
    //...
  };
  this.syntaxModel[type] = typeEntry;
};

syntax = (repoKey, syntaxName, opts = {}) => {
  const { references, root } = opts;
  this.syntaxModel[repoKey] = {
    // ...
  };
};
```

This could generate a rule model:

```ts
{
  'scope-block': {
    block: true,
    beginToken: {
      matches: '{',
      name: 'meta.brace.curly'
    },
    endToken: {
      matches: '}',
      name: 'meta.brace.curly'
    }
  },
  'var-ref': {
    syntax: {
      name: 'variable.other.private',
      matches: /[a-zA-Z]\w*/,
      in: 'expression'
    }
  },
  'control-statement': {
    syntax: {
      name: 'keyword.control',
      matches: ['FROM', 'WHERE'], // based on referenced token matches values
      in: 'expression',
    }
  },
  'expression': {
    references: ['control-statement', 'var-ref'],
    partOf: ['block'],
    root: true
  }
}
```

Which generates:

```ts
{
  // ...
    "var-ref": {
      "match": "(\\s*)(_+[a-zA-Z_0-9]+)",
      "name": "variable.other.private.sqlx"
    },
  "control-statement": {
    "match": "\\s*(?i)(SELECT|FROM|WHERE)\\b",
    "name": "keyword.where.sqlx",
  },
  "expression": {
    "name": "meta.expression.sqlx",
    "patterns": [
      {
        "include": "#control-statement"
      },
      {
        "include": "#var-ref"
      },
      // ...
    ]
  }
}
```

See `utils/syntax-gen` for utility functions that support generating a syntax model from such a model.

- `generateRepo(data, opts)`
- `generateSyntax(data, opts)`
- `generateSyntaxJson(data, opts)`

## Add SyntaxModel to Parser

See `utils/syntax-gen/model-gen`

`const MyParser = withSyntaxModeller($MyParser)`

This will add the special `consume` and `syntax` methods to your Parser.

To use the full syntax infrastructure:

```ts
const parser = new Parser(...args);
parser.parse(doc);
const { model } = parser.syntaxModel;
const syntaxJsonStr = generateSyntaxJson(model);
// write to syntax file
```

Cross your fingers that it works!
