import {
    LanguageServiceDefaults,
    LanguageServiceDefaultsImpl,
    diagnosticDefault,
    modeConfigurationDefault,
    registerLanguage,
} from '../_.contribution';
import {languages} from 'monaco-editor';
import {createProvideSuggestionsFunction} from '../helpers/createProvideSuggestionsFunction';
import {
    generateClickhouseAdditionalSuggestion,
    generateClickhouseOldSafariSuggestions,
} from './clickhouse.keywords';
import {MonacoLanguage} from '../../../constants/monaco';
import {loadWebsqlAutocomplete} from '../loadWebsqlAutocomplete';

registerLanguage({
    id: MonacoLanguage.CHYT,
    extensions: [],
    loader: async () => {
        const lang = await import(/* webpackChunkName: "yql-lang-clickhouse" */ './clickhouse');
        const autocomplete = await loadWebsqlAutocomplete();

        return {
            conf: lang.conf,
            language: lang.language,
            provideSuggestionsFunction: autocomplete
                ? createProvideSuggestionsFunction(
                      autocomplete.parseClickHouseQuery,
                      generateClickhouseAdditionalSuggestion,
                  )
                : generateClickhouseOldSafariSuggestions,
        };
    },
});

export const clickhouseDefaults: LanguageServiceDefaults = new LanguageServiceDefaultsImpl(
    MonacoLanguage.CHYT,
    diagnosticDefault,
    modeConfigurationDefault,
);

(languages as any)[MonacoLanguage.CHYT] = clickhouseDefaults;
