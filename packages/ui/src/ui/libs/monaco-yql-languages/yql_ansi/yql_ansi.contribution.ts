import {registerLanguage} from '../_.contribution';
import {provideSuggestionsFunction} from './yql_ansi';

export const LANGUAGE_ID = 'yql_ansi';

registerLanguage({
    id: LANGUAGE_ID,
    extensions: [],
    loader: () =>
        import('./yql_ansi').then((module) => {
            return {
                conf: module.conf,
                language: module.language,
                provideSuggestionsFunction: provideSuggestionsFunction,
            };
        }),
});
