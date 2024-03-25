import {
    LanguageServiceDefaults,
    LanguageServiceDefaultsImpl,
    diagnosticDefault,
    modeConfigurationDefault,
    registerLanguage,
} from '../_.contribution';
import {languages} from 'monaco-editor';
import {createProvideSuggestionsFunction} from '../helpers/createProvideSuggestionsFunction';
import {parseClickHouseQuery} from '@gravity-ui/websql-autocomplete';
import {generateClickhouseAdditionalSuggestion} from './clickhouse.keywords';
import {MonacoLanguage} from '../../../constants/monaco';

registerLanguage({
    id: MonacoLanguage.CHYT,
    extensions: [],
    loader: () =>
        import('./clickhouse').then((module) => {
            return {
                conf: module.conf,
                language: module.language,
                provideSuggestionsFunction: createProvideSuggestionsFunction(
                    parseClickHouseQuery,
                    generateClickhouseAdditionalSuggestion,
                ),
            };
        }),
});

export const clickhouseDefaults: LanguageServiceDefaults = new LanguageServiceDefaultsImpl(
    MonacoLanguage.CHYT,
    diagnosticDefault,
    modeConfigurationDefault,
);

(languages as any)[MonacoLanguage.CHYT] = clickhouseDefaults;
