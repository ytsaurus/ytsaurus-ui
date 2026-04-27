import React from 'react';
import {type DialogControlProps} from '../../components/Dialog/Dialog.types';
import {AccountSuggestImpl} from './AccountsSuggest';
import {selectCurrentUserName} from '../../store/selectors/global';
import {useSelector} from '../../store/redux-hooks';
import {showErrorPopup} from '../../utils/utils';
import {YTApiId, ytApiV3Id} from '../../rum/rum-wrap-api';
import {toaster} from '../../utils/toaster';
import i18n from './i18n';

export function UsableAccountSuggest(props: DialogControlProps<string | undefined>) {
    const {onChange, placeholder, value} = props;
    const [items, setItems] = React.useState<Array<string>>([]);

    const login = useSelector(selectCurrentUserName);
    React.useEffect(() => {
        ytApiV3Id
            .get(YTApiId.listUsableAccounts, {path: `//sys/users/${login}/@usable_accounts`})
            .then((accounts: Array<string>) => {
                setItems(accounts);
            })
            .catch((e: any) => {
                toaster.add({
                    name: 'usable_accounts',
                    theme: 'danger',
                    title: i18n('alert_failed-to-load-usable-accounts'),
                    content: e?.message,
                    actions: [{label: i18n('action_details'), onClick: () => showErrorPopup(e)}],
                    autoHiding: false,
                });
            });
    }, [login, setItems]);

    return (
        <AccountSuggestImpl
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            items={items}
        />
    );
}

UsableAccountSuggest.isEmpty = (value: string) => {
    return !value;
};

UsableAccountSuggest.getDefaultValue = () => {
    return '';
};
