import {useNavigationSettings} from '../../Widgets/Navigation/settings';
import {useOperationsSettings} from '../../Widgets/Operations/settings';
import {useAccountsSettings} from '../../Widgets/Accounts/settings';
import {usePoolsSettings} from '../../Widgets/Pools/settings';
import {useQueriesSettings} from '../../Widgets/Queries/settings';

export function useSettingsFields() {
    const accounts = useAccountsSettings();
    const pools = usePoolsSettings();
    const queries = useQueriesSettings();
    const operations = useOperationsSettings();
    const navigation = useNavigationSettings();

    const fieldsMap = {
        accounts,
        pools,
        queries,
        operations,
        navigation,
    };

    const getFields = (type?: string) => {
        return type ? fieldsMap[type] : [];
    };

    return {getFields} as const;
}
