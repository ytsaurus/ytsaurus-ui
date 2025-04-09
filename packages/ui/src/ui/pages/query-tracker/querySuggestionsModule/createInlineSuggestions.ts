import {CancellationToken, Position, editor, languages} from 'monaco-editor';
import {getRangeToInsertSuggestion} from '../../../libs/monaco-yql-languages/helpers/getRangeToInsertSuggestion';
import {QueryEngine} from '../../../../shared/constants/engines';
import {getWindowStore} from '../../../store/window-store';
import {getQuerySuggestionsEnabled} from '../../../store/selectors/settings/settings-queries';
import UIFactory from '../../../UIFactory';
import debounce_ from 'lodash/debounce';

const store = getWindowStore();
const getSuggestion = (data: {query: string; line: number; column: number; engine: string}) => {
    return UIFactory.getInlineSuggestionsApi()?.getQuerySuggestions(data);
};

const debouncedGetSuggestions = debounce_(getSuggestion, 200);

export const createInlineSuggestions =
    (engine: QueryEngine) =>
    async (
        model: editor.ITextModel,
        monacoCursorPosition: Position,
        _context: languages.InlineCompletionContext,
        _token: CancellationToken,
    ): Promise<{items: languages.InlineCompletion[]}> => {
        const state = store.getState();
        const enabled = getQuerySuggestionsEnabled(state);

        if (!enabled) {
            return {
                items: [],
            };
        }

        const response: string[] | undefined = await debouncedGetSuggestions({
            query: model.getValue(),
            line: monacoCursorPosition.lineNumber,
            column: monacoCursorPosition.column,
            engine,
        });

        if (!response) {
            return {
                items: [],
            };
        }

        const range = getRangeToInsertSuggestion(model, monacoCursorPosition);
        return {
            items: response.map((item) => {
                return {
                    insertText: item,
                    range,
                    command: {
                        id: 'accessQuerySuggestionsTelemetry',
                        title: 'string',
                        arguments: [],
                    },
                };
            }),
        };
    };
