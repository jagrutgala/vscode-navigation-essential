import * as vscode from "vscode";
import { findCharOccurrences } from "../../utils/find-char-occurrences";
import { findSelectRange } from "../../utils/find-select-range";

export const selectBetweenCommandFactory = (startChar: string, endChar: string, outer: boolean): (() => Promise<boolean | null>) => {
  return async () => {
    const fn = () => {
      let editor = vscode.window.activeTextEditor;
      if (editor === undefined || editor === null) {
        return false;
      }

      const selections = editor.selections;
      const doc = editor.document;
      editor.selections = selections.map((s) => {
        const docLine = doc.lineAt(s.active.line);
        const text = docLine.text;
        const line = s.active.line;
        const matches = findCharOccurrences(text, startChar);
        if (
            matches.length < 2
            || matches.filter(x => x >= s.active.character ).length === 0
            || matches.filter(x => x <= s.active.character ).length === 0
        ) {
          return s;
        }
        const [lb, ub] = findSelectRange(s.active.character, matches);
        let offset = 0;

        // Automatically grow to outer selection
        if (
          !outer &&
          new vscode.Position(line, lb + 1).isEqual(s.anchor) &&
          new vscode.Position(line, ub - 1).isEqual(s.end)
        ) {
          offset = startChar.length;
        }
        const p1 = new vscode.Position(line, lb + 1 - offset);
        const p2 = new vscode.Position(line, ub - 1 + offset);
        return new vscode.Selection(p1, p2);
      });
      return null;
    };
    return Promise.resolve(fn());
  };
};

export const selectBetweenSingleQuoteCommand = selectBetweenCommandFactory("'", false);

export const selectBetweenDoubleQuoteCommand = selectBetweenCommandFactory("\"", false);

