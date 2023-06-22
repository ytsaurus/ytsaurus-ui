import {
    LanguageServiceDefaults,
    LanguageServiceDefaultsImpl,
    diagnosticDefault,
    modeConfigurationDefault,
    registerLanguage,
} from '../_.contribution';
import {languages} from '../fillers/monaco-editor-core';

export const LANGUAGE_ID = 'clickhouse';

registerLanguage({
    id: LANGUAGE_ID,
    extensions: [],
    loader: () =>
        import('./clickhouse').then((module) => {
            return {
                conf: module.conf,
                language: module.language,
                completions: module.completionLists,
            };
        }),
});

export const clickhouseDefaults: LanguageServiceDefaults = new LanguageServiceDefaultsImpl(
    LANGUAGE_ID,
    diagnosticDefault,
    modeConfigurationDefault,
);

(languages as any)[LANGUAGE_ID] = clickhouseDefaults;
