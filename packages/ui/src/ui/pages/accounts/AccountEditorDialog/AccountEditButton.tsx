import React from 'react';

import Button, {type ButtonProps} from '../../../components/Button/Button';
import Icon from '../../../components/Icon/Icon';
import {useAccountEditor} from './AccountEditorContext';
import i18n from './i18n';

interface AccountEditButtonProps {
    accountName: string;
    children?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    qa?: string;
    size?: ButtonProps['size'];
    title?: string;
    view?: ButtonProps['view'];
}

export function AccountEditButton({accountName, disabled, ...props}: AccountEditButtonProps) {
    const {openingAccountName, openedAccountName, openAccount} = useAccountEditor();
    const currentAccountName = openingAccountName || openedAccountName;
    const loading = openingAccountName === accountName;
    const anotherAccountIsOpening = Boolean(
        currentAccountName && currentAccountName !== accountName,
    );

    const handleClick = React.useCallback(() => {
        openAccount(accountName).catch(() => undefined);
    }, [accountName, openAccount]);

    return (
        <Button
            {...props}
            disabled={disabled || Boolean(openedAccountName) || anotherAccountIsOpening}
            loading={loading}
            title={props.title || i18n('action_edit-account')}
            onClick={handleClick}
        >
            {props.children || <Icon awesome="pencil" size={13} />}
        </Button>
    );
}
