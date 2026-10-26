import React from 'react';
import Button from '../../../../../components/Button/Button';
import HelpLink from '../../../../../components/HelpLink/HelpLink';
import {docsUrl} from '../../../../../config';
import {openCreateModal} from '../../../../../store/actions/accounts/editor';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {selectActiveAccount} from '../../../../../store/selectors/accounts/accounts-ts';
import {selectCurrentClusterConfig} from '../../../../../store/selectors/global/cluster';
import {selectIsAdmin} from '../../../../../store/selectors/global/is-developer';
import UIFactory from '../../../../../UIFactory';
import i18n from './i18n';

interface Props {
    className?: string;
}

function AccountCreate({className}: Props) {
    const currentAccount = useSelector(selectActiveAccount);
    const clusterConfig = useSelector(selectCurrentClusterConfig);
    const isDeveloper = useSelector(selectIsAdmin);

    const dispatch = useDispatch();

    const createAccountUrl = UIFactory.getAccountCreateUrl({
        currentAccount,
        clusterConfig,
        isDeveloper,
    });

    if (createAccountUrl) {
        return (
            <span className={className}>
                {docsUrl(<HelpLink url={createAccountUrl} text={i18n('title_create-account')} />)}
            </span>
        );
    }

    return (
        <span className={className}>
            <Button
                actionRole="primary"
                view="action"
                title={i18n('title_create-account')}
                onClick={() => dispatch(openCreateModal())}
            >
                {i18n('title_create-account')}
            </Button>
        </span>
    );
}

export default AccountCreate;
