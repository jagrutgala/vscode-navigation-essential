import { singleSelect, selectEitherQuote, switchQuotes, matchingSelect } from "../vscode-quick-select";

const _ = undefined;

export const selectDoubleQuoteCommand = singleSelect.bind(_, { char: '"' });
export const selectSingleQuoteCommand = singleSelect.bind(_, { char: "'" });
export const selectEitherQuoteCommand = selectEitherQuote;
export const switchQuotesCommand = switchQuotes;
export const selectBackTickCommand = singleSelect.bind(_, { char: "`", multiline: true });
export const selectParenthesisCommand = matchingSelect.bind(_, { start_char: "(", end_char: ")" });
export const selectSquareBracketsCommand = matchingSelect.bind(_, { start_char: "[", end_char: "]" });
export const selectCurlyBracketsCommand = matchingSelect.bind(_, { start_char: "{", end_char: "}" });
export const selectParenthesisOuterCommand = matchingSelect.bind(_, { start_char: "(", end_char: ")", outer: true });
export const selectSquareBracketsOuterCommand = matchingSelect.bind(_, { start_char: "[", end_char: "]", outer: true });
export const selectCurlyBracketsOuterCommand = matchingSelect.bind(_, { start_char: "{", end_char: "}", outer: true });
export const selectAngleBracketsCommand = matchingSelect.bind(_, { start_char: "<", end_char: ">" });
export const selectInTagCommand = matchingSelect.bind(_, { start_char: ">", end_char: "<" });
