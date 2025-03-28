import {CancellationToken, Position, editor, languages} from 'monaco-editor';
import {Parser, getSuggestions} from './getSuggestions';
import {getRangeToInsertSuggestion} from './getRangeToInsertSuggestion';
import {getDirectoryContent} from './getDirectoryContent';
import {QueryEngine} from '../../../pages/query-tracker/module/engines';
import {getColumnSuggestions} from './getColumnSuggestions';
import {getTemplateSuggestions} from './getTemplateSuggestions';

export const createProvideSuggestionsFunction =
    (parser: Parser, engine: QueryEngine) =>
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
        const pathSuggestions = await getDirectoryContent({
            model,
            monacoCursorPosition,
            engine,
            range,
        });

        const columnsSuggestions = await getColumnSuggestions({
            model,
            engine,
            tableSuggestions: parseResult.suggestColumns,
            range,
        });

        const templateSuggestions = getTemplateSuggestions({model, parseResult, range});
        const suggestions = getSuggestions(parseResult, range);

        return {
            suggestions: [
                ...templateSuggestions,
                ...columnsSuggestions,
                ...pathSuggestions,
                ...suggestions,
            ],
        };
    };
