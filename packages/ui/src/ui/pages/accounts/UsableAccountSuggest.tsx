import React from 'react';
import {DialogControlProps} from '../../components/Dialog/Dialog.types';
import {AccountSuggestImpl} from './AccountsSuggest';
import {getCurrentUserName} from '../../store/selectors/global';
import {useSelector} from '../../store/redux-hooks';
import {showErrorPopup} from '../../utils/utils';
import {YTApiId, ytApiV3Id} from '../../rum/rum-wrap-api';
import {toaster} from '../../utils/toaster';

export function UsableAccountSuggest(props: DialogControlProps<string | undefined>) {
    const {onChange, placeholder, value} = props;
    const [items, setItems] = React.useState<Array<string>>([]);

    const login = useSelector(getCurrentUserName);
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
                    title: 'Failed to load usable accounts',
                    content: e?.message,
                    actions: [{label: ' Details', onClick: () => showErrorPopup(e)}],
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
