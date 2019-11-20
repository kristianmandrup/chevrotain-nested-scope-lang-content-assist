import _ from "lodash";
import { tokenMap, parse as parseJsonToCst } from "./error-recovery";
const { LCurly, RCurly, Colon, StringLiteral, NumberLiteral } = tokenMap;

const context = describe;

describe("Chevrotain Tutorial", () => {
  context("Step 4 - Fault tolerance and error recovery", () => {
    // to make it easier to understand the assertions
    function minimizeCst(cstElement: any) {
      // tokenType idx is auto generated, can't assert over it
      if (cstElement.tokenTypeIdx) {
        delete cstElement.tokenTypeIdx;
      }

      // CstNode
      if (cstElement.children !== undefined) {
        cstElement.children = _.omitBy(cstElement.children, _.isEmpty);
        _.forEach(cstElement.children, childArr => {
          _.forEach(childArr, minimizeCst);
        });
      }

      return cstElement;
    }

    it("Can perform single token insertion recovery", () => {
      let invalidInput = '{ "key"   696}';
      let parsingResult = parseJsonToCst(invalidInput);
      expect(parsingResult.parseErrors).toHaveLength(1);
      expect(parsingResult.parseErrors[0].message).toInclude(
        "Expecting token of type --> Colon <-- but found --> '696' <--"
      );
      let minimizedCst = minimizeCst(parsingResult.cst);

      // even though an error occurred, the whole input was parsed successfully and the output structure created.
      expect(minimizedCst).toEqual({
        name: "json",
        children: {
          object: [
            {
              name: "object",
              children: {
                LCurly: [
                  {
                    image: "{",
                    startOffset: 0,
                    tokenType: LCurly
                  }
                ],
                objectItem: [
                  {
                    name: "objectItem",
                    children: {
                      StringLiteral: [
                        {
                          image: '"key"',
                          startOffset: 2,
                          tokenType: StringLiteral
                        }
                      ],
                      // This missing colon token was inserted in recovery.
                      Colon: [
                        {
                          image: "",
                          startOffset: NaN,
                          endOffset: NaN,
                          startLine: NaN,
                          endLine: NaN,
                          startColumn: NaN,
                          endColumn: NaN,
                          isInsertedInRecovery: true,
                          tokenType: Colon
                        }
                      ],
                      // the value rule appears AFTER the error (missing colon) yet it was still parsed successfully
                      // due to the error recovery.
                      value: [
                        {
                          name: "value",
                          children: {
                            NumberLiteral: [
                              {
                                image: "696",
                                startOffset: 10,
                                tokenType: NumberLiteral
                              }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ],
                RCurly: [
                  {
                    image: "}",
                    startOffset: 13,
                    tokenType: RCurly
                  }
                ]
              }
            }
          ]
        }
      });
    });

    it("Can perform single token deletion recovery", () => {
      let invalidInput = '{ "key" }: 696}';
      let parsingResult = parseJsonToCst(invalidInput);
      expect(parsingResult.parseErrors).toHaveLength(1);
      expect(parsingResult.parseErrors[0].message).toInclude(
        "Expecting token of type --> Colon <-- but found --> '}' <--"
      );
      let minimizedCst = minimizeCst(parsingResult.cst);

      // even though an error occurred, the whole input was parsed successfully and the output structure created.
      expect(minimizedCst).toEqual({
        name: "json",
        children: {
          object: [
            {
              name: "object",
              children: {
                LCurly: [
                  {
                    image: "{",
                    startOffset: 0,
                    tokenType: LCurly
                  }
                ],
                objectItem: [
                  {
                    name: "objectItem",
                    children: {
                      StringLiteral: [
                        {
                          image: '"key"',
                          startOffset: 2,
                          tokenType: StringLiteral
                        }
                      ],
                      // The out of place '}' brackets were ignored and the colon token was parsed instead.
                      Colon: [
                        {
                          image: ":",
                          startOffset: 9,
                          tokenType: Colon
                        }
                      ],
                      // the value rule appears AFTER the error (out of place '}' brackets) yet it was still parsed
                      // successfully due to the error recovery.
                      value: [
                        {
                          name: "value",
                          children: {
                            NumberLiteral: [
                              {
                                image: "696",
                                startOffset: 11,
                                tokenType: NumberLiteral
                              }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ],
                RCurly: [
                  {
                    image: "}",
                    startOffset: 14,
                    tokenType: RCurly
                  }
                ]
              }
            }
          ]
        }
      });
    });

    it("Can perform in repetition re-sync recovery", () => {
      // the '696' number literal should not appear after the "2"
      let invalidInput =
        '{\n"key1" : 1, \n"key2" : 2 696 \n"key3"  : 3, \n"key4"  : 4 }';
      let parsingResult = parseJsonToCst(invalidInput);
      expect(parsingResult.parseErrors).toHaveLength(1);
      expect(parsingResult.parseErrors[0].message).toInclude(
        "Expecting token of type --> RCurly <-- but found --> '696'"
      );
      let minimizedCst = minimizeCst(parsingResult.cst);

      // extract the key/value pairs
      let objectItemCstArr =
        minimizedCst.children.object[0].children.objectItem;
      // The original input has 4 keys, but after recover the 3rd key should be skipped (re-synced)
      // because the parser will re-sync to the next comma "," as that is the expected next Token after a key/value pair.
      expect(objectItemCstArr).toHaveLength(3);
      expect(objectItemCstArr[0].children.StringLiteral[0].image).toEqual(
        '"key1"'
      );
      expect(objectItemCstArr[1].children.StringLiteral[0].image).toEqual(
        '"key2"'
      );
      // key3 will be re-synced
      // key4 appears in the input AFTER the error, yet due to error recovery it is still appears in the output
      expect(objectItemCstArr[2].children.StringLiteral[0].image).toEqual(
        '"key4"'
      );
    });

    it("Can perform  Between Rules Re-Sync recovery", () => {
      let invalidInput =
        "{ \n" +
        '"firstName": "John",\n ' +
        '"someData": { "bad" :: "part" }, \n' +
        '"isAlive": true, \n' +
        '"age": 25 \n' +
        "}";
      let parsingResult = parseJsonToCst(invalidInput);
      expect(parsingResult.parseErrors).toHaveLength(1);
      expect(parsingResult.parseErrors[0].message).toInclude(
        "Expecting: one of these possible Token sequences:\n  1. [StringLiteral]\n  2. [NumberLiteral]\n  3. [LCurly]\n  4. [LSquare]\n  5. [True]\n  6. [False]\n  7. [Null]\nbut found: ':'"
      );
      let minimizedCst = minimizeCst(parsingResult.cst);

      // extract the key/value pairs
      let objectItemCstArr =
        minimizedCst.children.object[0].children.objectItem;
      expect(objectItemCstArr).toHaveLength(4);
      expect(objectItemCstArr[0].children.StringLiteral[0].image).toEqual(
        '"firstName"'
      );
      // There is an error inside "someData" value, but we still get the key back (and part of the value...)
      expect(objectItemCstArr[1].children.StringLiteral[0].image).toEqual(
        '"someData"'
      );
      // These keys appear AFTER the error, yet they were still parsed successfully due to error recovery.
      expect(objectItemCstArr[2].children.StringLiteral[0].image).toEqual(
        '"isAlive"'
      );
      expect(objectItemCstArr[3].children.StringLiteral[0].image).toEqual(
        '"age"'
      );
    });
  });
});
