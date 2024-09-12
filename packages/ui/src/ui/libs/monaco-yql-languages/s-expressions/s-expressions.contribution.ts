import {registerLanguage} from '../_.contribution';

export const LANGUAGE_ID = 's-expression';

registerLanguage({
    id: LANGUAGE_ID,
    extensions: [],
    loader: () =>
        import(/* webpackChunkName: "yql-s-expressions" */ './s-expressions').then((module) => {
            return {
                conf: module.conf,
                language: module.language,
                provideSuggestionsFunction: module.provideSuggestionsFunction,
            };
        }),
});
