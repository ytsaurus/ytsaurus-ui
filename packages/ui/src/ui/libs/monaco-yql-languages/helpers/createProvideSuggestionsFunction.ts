import {CancellationToken, IRange, Position, editor, languages} from 'monaco-editor';
import {Parser, getSuggestions} from './getSuggestions';
import {getRangeToInsertSuggestion} from './getRangeToInsertSuggestion';
import {ClickHouseAutocompleteResult} from '@gravity-ui/websql-autocomplete';

export const createProvideSuggestionsFunction =
    (
        parser: Parser,
        additionalSuggestions?: (
            rangeToInsertSuggestion: IRange,
            parserResult: ClickHouseAutocompleteResult,
        ) => languages.CompletionItem[],
    ) =>
    (
        model: editor.ITextModel,
        monacoCursorPosition: Position,
        _context: languages.CompletionContext,
        _token: CancellationToken,
    ) => {
        const parseResult = parser(model.getValue(), {
            line: monacoCursorPosition.lineNumber,
            column: monacoCursorPosition.column,
        });
        const range = getRangeToInsertSuggestion(model, monacoCursorPosition);
        const additionalSuggestion = additionalSuggestions
            ? additionalSuggestions(range, parseResult)
            : [];

        return {suggestions: [...getSuggestions(parseResult, range), ...additionalSuggestion]};
    };
