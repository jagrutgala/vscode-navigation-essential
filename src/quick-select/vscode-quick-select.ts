import * as vscode from "vscode";

export function findOccurrences(doc: vscode.TextDocument, line: number, char: string): Array<number> {
  var content = doc.lineAt(line);
  var matches = (content.text + "hack").split(char).reduce((acc, p) => {
    var len = p.length + 1;
    if (acc.length > 0) {
      len += acc[acc.length - 1];
    }
    acc.push(len);
    return acc;
  }, new Array());
  matches.pop();
  return matches;
}

export function findNext(
  doc: vscode.TextDocument,
  line: number,
  char: string,
  start_index: number = 0,
  nest_char: string | undefined = undefined,
  nested: number = 0
): vscode.Position | undefined {
  if (line === doc.lineCount) {
    return undefined;
  }
  var occurrences = findOccurrences(doc, line, char).filter((n) => n >= start_index);
  var nests = nest_char ? findOccurrences(doc, line, nest_char).filter((n) => n >= start_index) : [];
  var occurrence_index = 0;
  var nests_index = 0;
  while ((occurrence_index < occurrences.length || nests_index < nests.length) && nested >= 0) {
    if (occurrences[occurrence_index] < nests[nests_index] || !nests[nests_index]) {
      if (nested === 0) {
        return new vscode.Position(line, occurrences[occurrence_index]);
      }
      nested--;
      occurrence_index++;
    } else if (nests[nests_index] < occurrences[occurrence_index] || !occurrences[occurrence_index]) {
      nested++;
      nests_index++;
    }
  }
  return findNext(doc, ++line, char, 0, nest_char, nested);
}
export function findPrevious(
  doc: vscode.TextDocument,
  line: number,
  char: string,
  start_index?: number,
  nest_char: string | undefined = undefined,
  nested: number = 0
): vscode.Position | undefined {
  if (line === -1) {
    return undefined;
  }
  if (start_index === undefined) {
    start_index = doc.lineAt(line).text.length;
  }
  var occurrences = findOccurrences(doc, line, char).filter((n) => n <= start_index);
  var nests = nest_char ? findOccurrences(doc, line, nest_char).filter((n) => n <= start_index) : [];
  var occurrence_index = occurrences.length - 1;
  var nests_index = nests.length - 1;
  while ((occurrence_index > -1 || nests_index > -1) && nested >= 0) {
    if (occurrences[occurrence_index] > nests[nests_index] || !nests[nests_index]) {
      if (nested === 0) {
        return new vscode.Position(line, occurrences[occurrence_index]);
      }
      nested--;
      occurrence_index--;
    } else if (nests[nests_index] > occurrences[occurrence_index] || !occurrences[occurrence_index]) {
      nested++;
      nests_index--;
    }
  }
  return findPrevious(doc, --line, char, undefined, nest_char, nested);
}

export function findSingleSelect(
  s: vscode.Selection,
  doc: vscode.TextDocument,
  char: string,
  outer?: boolean,
  multiline?: boolean
) {
  let { line, character } = s.active;
  let matches = findOccurrences(doc, line, char);
  let next = matches.find((a) => a > character);
  if (next === undefined || next === null) {
    return s;
  }
  let next_index = matches.indexOf(next);
  let offset = outer ? char.length : 0;
  if (matches.length > 1 && matches.length % 2 === 0) {
    // Jump inside the next matching pair
    if (next === -1) {
      return s;
    }
    if (next_index % 2 !== 0) {
      next_index--;
    }
    //Automatically grow to outer selection
    if (
      !outer &&
      new vscode.Position(line, matches[next_index]).isEqual(s.anchor) &&
      new vscode.Position(line, matches[next_index + 1] - 1).isEqual(s.end)
    ) {
      offset = char.length;
    }
    return new vscode.Selection(
      new vscode.Position(line, matches[next_index] - offset),
      new vscode.Position(line, matches[next_index + 1] - 1 + offset)
    );
  } else if (multiline) {
    let start_pos = findPrevious(doc, line, char, character) || new vscode.Position(line, matches[next_index]);
    if (!start_pos) {
      return s;
    }
    let end_pos: vscode.Position = findNext(doc, start_pos.line, char, start_pos.character + 1) ?? s.end;
    //Automatically grow to outer selection
    if (
      !outer &&
      start_pos.isEqual(s.anchor) &&
      new vscode.Position(end_pos.line, end_pos.character - 1).isEqual(s.end)
    ) {
      offset = char.length;
    }
    if (start_pos && end_pos) {
      start_pos = new vscode.Position(start_pos.line, start_pos.character - offset);
      end_pos = new vscode.Position(end_pos.line, end_pos.character - 1 + offset);
      return new vscode.Selection(start_pos, end_pos);
    }
  }
  return s;
}

interface SingleSelectOptions {
  char: string;
  outer?: boolean;
  multiline?: boolean;
}
export function singleSelect({ char, outer = false, multiline = false }: SingleSelectOptions) {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  let doc = editor.document;
  let sel = editor.selections;
  editor.selections = sel.map((s) => findSingleSelect(s, doc, char, outer, multiline));
}

export function getSwitchableQuotes() {
  const includeBackTicks = vscode.workspace.getConfiguration("quick-select").get<boolean>("includeBackticks");
  return ['"', "'"].concat(includeBackTicks ? ["`"] : []);
}

export function selectEitherQuote() {
  const switchableQuotes = getSwitchableQuotes();
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  let doc = editor.document;
  let sel = editor.selections;
  editor.selections = sel.map((s: vscode.Selection) => {
    let selections = switchableQuotes
      .map((char) => findSingleSelect(s, doc, char, false, false))
      .filter((sel) => sel !== s)
      .filter((sel) => sel.start.isBeforeOrEqual(s.start) && sel.end.isAfterOrEqual(s.end))
      .sort((a, b) => (a.start.isBefore(b.start) ? 1 : -1));
    if (selections.length > 0) {
      return selections[0];
    }
    return s;
  });
}

export function charRange(p: vscode.Position) {
  let end_pos = new vscode.Position(p.line, p.character + 1);
  return new vscode.Selection(p, end_pos);
}
export function switchQuotes() {
  const switchables = getSwitchableQuotes();
  let editor = vscode.window.activeTextEditor;
  if (editor === undefined || editor === null) {
    return;
  }
  let original_sel = editor.selections;
  selectEitherQuote();
  if (!editor) {
    return;
  }
  let doc = editor.document;
  let sel = editor.selections;
  sel.map((s: vscode.Selection) => {
    if (s.start.isEqual(s.end)) {
      return;
    }
    //expand selection if needed
    let expand_start = switchables.indexOf(doc.getText(charRange(s.start))) === -1 ? 1 : 0;
    let expand_end = switchables.indexOf(doc.getText(charRange(s.end))) === -1 ? 1 : 0;
    let start_pos = new vscode.Position(s.start.line, s.start.character - expand_start);
    let end_pos = new vscode.Position(s.end.line, s.end.character - expand_end);
    s = new vscode.Selection(start_pos, end_pos);
    var char = doc.getText(charRange(s.start));
    var edit = new vscode.WorkspaceEdit();
    let next_index = switchables.indexOf(char) + 1;
    if (next_index === switchables.length) {
      next_index = 0;
    }
    let next_char = switchables[next_index];
    edit.replace(doc.uri, charRange(s.start), next_char);
    edit.replace(doc.uri, charRange(s.end), next_char);
    vscode.workspace.applyEdit(edit);
    doc.getText();
  });
  // restore orignal selection
  console.log(original_sel);
  editor.selections = original_sel;
  console.log(editor.selections);
}
interface MatchingSelectOptions {
  start_char: string;
  end_char: string;
  outer?: boolean;
}
export function matchingSelect({ start_char, end_char, outer = false }: MatchingSelectOptions) {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  let doc = editor.document;
  let sel = editor.selections;
  let success = false;
  let start_offset = outer ? start_char.length : 0;
  let end_offset = outer ? end_char.length : 0;
  editor.selections = sel.map((s) => {
    let { line, character } = s.active;
    let starts = findOccurrences(doc, line, start_char);
    let ends = findOccurrences(doc, line, end_char);
    let start = starts.find((a) => a > character);
    let end = ends.find((a) => a > character);
    // if (start === undefined || start === null) {
    //   return s;
    // }
    // if (end === undefined || end === null) {
    //   return s;
    // }
    let start_index = starts.indexOf(start ?? 0);
    let end_index = ends.indexOf(end ?? 0);
    let start_pos: vscode.Position =
      findPrevious(doc, line, start_char, character, end_char) || new vscode.Position(line, starts[start_index]);
    if (!start_pos) {
      return s;
    }
    let end_pos: vscode.Position =
      findNext(doc, start_pos.line, end_char, start_pos.character + 1, start_char) ?? s.end;
    if (start_pos && end_pos) {
      success = true;
      //Automatically grow to outer selection
      if (
        !outer &&
        start_pos.isEqual(s.anchor) &&
        new vscode.Position(end_pos.line, end_pos.character - 1).isEqual(s.end)
      ) {
        start_offset = start_char.length;
        end_offset = end_char.length;
      }
      start_pos = new vscode.Position(start_pos.line, start_pos.character - start_offset);
      end_pos = new vscode.Position(end_pos.line, end_pos.character - 1 + end_offset);
      return new vscode.Selection(start_pos, end_pos);
    }
    return s;
  });
  if (success && start_char === "<") {
    vscode.commands.executeCommand("editor.action.addSelectionToNextFindMatch");
  }
}
