import * as vscode from "vscode";

export const quickOpenPrefillCommand = () => {
    vscode.commands.executeCommand(
        'workbench.action.quickOpen',
        vscode.window.activeTextEditor?.document.getText(vscode.window.activeTextEditor.selection)
    );
};
