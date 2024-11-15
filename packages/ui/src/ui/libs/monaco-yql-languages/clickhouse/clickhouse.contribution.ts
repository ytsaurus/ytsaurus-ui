import {
    LanguageServiceDefaults,
    LanguageServiceDefaultsImpl,
    diagnosticDefault,
    modeConfigurationDefault,
    registerLanguage,
} from '../_.contribution';
import {languages} from 'monaco-editor';
import {createProvideSuggestionsFunction} from '../helpers/createProvideSuggestionsFunction';
import {generateClickhouseOldSafariSuggestions} from './clickhouse.keywords';
import {MonacoLanguage} from '../../../constants/monaco';
import {QueryEngine} from '../../../pages/query-tracker/module/engines';

registerLanguage({
    id: MonacoLanguage.CHYT,
    extensions: [],
    loader: async () => {
        const lang = await import(/* webpackChunkName: "yql-lang-clickhouse" */ './clickhouse');
        const autocomplete = await import(
            /* webpackChunkName: "clickhouse-autocomplete" */ '@gravity-ui/websql-autocomplete/clickhouse'
        );

        return {
            conf: lang.conf,
            language: lang.language,
            provideSuggestionsFunction: autocomplete
                ? createProvideSuggestionsFunction(
                      autocomplete.parseClickHouseQuery,
                      QueryEngine.CHYT,
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
