import {CancellationToken, IRange, Position, editor, languages} from 'monaco-editor';
import {Parser, getSuggestions} from './getSuggestions';
import {getRangeToInsertSuggestion} from './getRangeToInsertSuggestion';
import {ClickHouseAutocompleteResult} from '@gravity-ui/websql-autocomplete';
import {getDirectoryContent} from './getDirectoryContent';
import {QueryEngine} from '../../../pages/query-tracker/module/engines';

export const createProvideSuggestionsFunction =
    (
        parser: Parser,
        engine: QueryEngine,
        additionalSuggestions?: (
            rangeToInsertSuggestion: IRange,
            parserResult: ClickHouseAutocompleteResult,
        ) => languages.CompletionItem[],
    ) =>
    async (
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
        let pathSuggestions: languages.CompletionItem[] = [];
        if ('suggestEntity' in parseResult && parseResult.suggestEntity?.includes('table')) {
            pathSuggestions = await getDirectoryContent({
                model,
                monacoCursorPosition,
                engine,
                range,
            });
        }

        const additionalSuggestion = additionalSuggestions
            ? additionalSuggestions(range, parseResult)
            : [];

        return {
            suggestions: [
                ...pathSuggestions,
                ...getSuggestions(parseResult, range),
                ...additionalSuggestion,
            ],
        };
    };
