import * as vscode from "vscode";

export interface CommandMap {
  commandId: string;
  command: (...args: any[]) => any;
}

export class RegisterCommandService {
  private _commandsMap: CommandMap[];
  private _context !: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this._commandsMap = [];
    this._context = context;
  }
  registerCommand (commandId: string, command: (...args: any[]) => any) {
    this._commandsMap.push({ commandId, command });
    let disposable = vscode.commands.registerCommand(
      commandId,
      command
    );
    this._context.subscriptions.push(disposable);
  }

  get commandsMap () {
    return [...this._commandsMap];
  }
}

