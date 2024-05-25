// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { RegisterCommandService } from "./utils/registerCommand";
import {
  selectDoubleQuoteCommand,
  selectSingleQuoteCommand,
  selectEitherQuoteCommand,
  switchQuotesCommand,
  selectBackTickCommand,
  selectParenthesisCommand,
  selectSquareBracketsCommand,
  selectCurlyBracketsCommand,
  selectParenthesisOuterCommand,
  selectSquareBracketsOuterCommand,
  selectCurlyBracketsOuterCommand,
  selectAngleBracketsCommand,
  selectInTagCommand,
} from "./quick-select/commands/commands";
import { quickOpenPrefillCommand } from "./quick-open-prefill/commands/commands";
import { changeLanguageToJson, changeLanguageToJsonC } from "./commands/change-language-mode.command";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "navigation-essential" is now active!');

  const registerCommandService: RegisterCommandService = new RegisterCommandService(context);

  registerCommandService.registerCommand("navigation-essentials.selectDoubleQuote", selectDoubleQuoteCommand);
  registerCommandService.registerCommand("navigation-essentials.selectSingleQuote", selectSingleQuoteCommand);
  registerCommandService.registerCommand("navigation-essentials.selectEitherQuote", selectEitherQuoteCommand);
  registerCommandService.registerCommand("navigation-essentials.switchQuotes", switchQuotesCommand);
  registerCommandService.registerCommand("navigation-essentials.selectBackTick", selectBackTickCommand);
  registerCommandService.registerCommand("navigation-essentials.selectParenthesis", selectParenthesisCommand);
  registerCommandService.registerCommand("navigation-essentials.selectSquareBrackets", selectSquareBracketsCommand);
  registerCommandService.registerCommand("navigation-essentials.selectCurlyBrackets", selectCurlyBracketsCommand);
  registerCommandService.registerCommand("navigation-essentials.selectParenthesisOuter", selectParenthesisOuterCommand);
  registerCommandService.registerCommand(
    "navigation-essentials.selectSquareBracketsOuter",
    selectSquareBracketsOuterCommand
  );
  registerCommandService.registerCommand(
    "navigation-essentials.selectCurlyBracketsOuter",
    selectCurlyBracketsOuterCommand
  );
  registerCommandService.registerCommand("navigation-essentials.selectAngleBrackets", selectAngleBracketsCommand);
  registerCommandService.registerCommand("navigation-essentials.selectInTag", selectInTagCommand);

  registerCommandService.registerCommand("navigation-essentials.quickOpenPrefill", quickOpenPrefillCommand);

  registerCommandService.registerCommand("navigation-essentials.changeLanguageToJson", changeLanguageToJson);
  registerCommandService.registerCommand("navigation-essentials.changeLanguageToJsonC", changeLanguageToJsonC);

}

// This method is called when your extension is deactivated
export function deactivate() {}
