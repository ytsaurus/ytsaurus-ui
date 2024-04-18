import {registerLanguage} from '../_.contribution';
import {createProvideSuggestionsFunction} from '../helpers/createProvideSuggestionsFunction';
import {MonacoLanguage} from '../../../constants/monaco';
import {generateYqlOldSafariSuggestion} from './yql.keywords';
import {loadWebsqlAutocomplete} from '../loadWebsqlAutocomplete';

registerLanguage({
    id: MonacoLanguage.YQL,
    extensions: [],
    loader: async () => {
        const lang = await import(/* webpackChunkName: "yql-lang-yql" */ './yql');
        const autocomplete = await loadWebsqlAutocomplete();

        return {
            conf: lang.conf,
            language: lang.language,
            provideSuggestionsFunction: autocomplete
                ? createProvideSuggestionsFunction(autocomplete.parseYqlQuery)
                : generateYqlOldSafariSuggestion,
        };
    },
});
