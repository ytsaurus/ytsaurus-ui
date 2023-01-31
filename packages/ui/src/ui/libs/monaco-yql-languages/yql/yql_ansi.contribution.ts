import {registerLanguage} from '../_.contribution';

export const LANGUAGE_ID = 'yql_ansi';

registerLanguage({
    id: LANGUAGE_ID,
    extensions: [],
    loader: () =>
        import('./yql').then((module) => {
            return {
                conf: module.conf,
                language: module.getLanguage({ansi: true}),
            };
        }),
});
