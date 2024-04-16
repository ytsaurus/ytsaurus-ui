import {registerLanguage} from '../_.contribution';
import {createProvideSuggestionsFunction} from '../helpers/createProvideSuggestionsFunction';
import {parseYqlQuery} from '@gravity-ui/websql-autocomplete';
import {MonacoLanguage} from '../../../constants/monaco';

registerLanguage({
    id: MonacoLanguage.YQL,
    extensions: [],
    loader: () =>
        import('./yql').then((module) => {
            return {
                conf: module.conf,
                language: module.language,
                provideSuggestionsFunction: createProvideSuggestionsFunction(parseYqlQuery),
            };
        }),
});
