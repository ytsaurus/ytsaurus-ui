import React from 'react';
import {DialogControlProps} from '../../components/Dialog/Dialog.types';
import {AccountSuggestImpl} from './AccountsSuggest';
import {getCurrentUserName} from '../../store/selectors/global';
import {useSelector} from 'react-redux';
import {Toaster} from '@gravity-ui/uikit';
import {showErrorPopup} from '../../utils/utils';
import {YTApiId, ytApiV3Id} from '../../rum/rum-wrap-api';

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
                const toaster = new Toaster();
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
