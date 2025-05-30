import {useNavigationSettings} from '../../Widgets/Navigation/settings';
import {useOperationsSettings} from '../../Widgets/Operations/settings';
import {useAccountsSettings} from '../../Widgets/Accounts/settings';
import {usePoolsSettings} from '../../Widgets/Pools/settings';
import {useQueriesSettings} from '../../Widgets/Queries/settings';
import {useServicesSettings} from '../../Widgets/Services/settings';

export function useSettingsFields() {
    const accounts = useAccountsSettings();
    const pools = usePoolsSettings();
    const queries = useQueriesSettings();
    const operations = useOperationsSettings();
    const navigation = useNavigationSettings();
    const services = useServicesSettings();

    const fieldsMap = {
        accounts,
        pools,
        queries,
        operations,
        navigation,
        services,
    };

    const getFields = (type?: string) => {
        return fieldsMap?.[type as keyof typeof fieldsMap] ?? [];
    };

    return {getFields} as const;
}
