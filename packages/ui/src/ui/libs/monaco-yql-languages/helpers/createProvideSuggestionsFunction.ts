import * as monaco from 'monaco-editor';
import {Parser, getSuggestions} from './getSuggestions';
import {getRangeToInsertSuggestion} from './getRangeToInsertSuggestion';

export const createProvideSuggestionsFunction =
    (parser: Parser) =>
    (
        model: monaco.editor.ITextModel,
        monacoCursorPosition: monaco.Position,
        _context: monaco.languages.CompletionContext,
        _token: monaco.CancellationToken,
    ) => {
        const suggestions = getSuggestions(
            model,
            {
                line: monacoCursorPosition.lineNumber,
                column: monacoCursorPosition.column,
            },
            getRangeToInsertSuggestion(model, monacoCursorPosition),
            parser,
        );

        return {suggestions};
    };
