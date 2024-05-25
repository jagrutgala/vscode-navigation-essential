import * as vscode from "vscode";

const changeLanguageTo = (languageId: string) => {
    const editor = vscode.window.activeTextEditor;
    if (editor == undefined || editor == null) {
      return;
    }
    vscode.languages.setTextDocumentLanguage(editor.document, languageId);
};

export const changeLanguageToJson = () => {
    changeLanguageTo("json");
};

export const changeLanguageToJsonC = () => {
    changeLanguageTo("jsonc");
};
