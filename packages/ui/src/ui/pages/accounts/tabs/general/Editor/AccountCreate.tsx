import {CircleInfo} from '@gravity-ui/icons';
import {Flex, Icon} from '@gravity-ui/uikit';
import React from 'react';
import {useHistory} from 'react-router';
import Button from '../../../../../components/Button/Button';
import {Tooltip} from '@ytsaurus/components';
import {Page} from '../../../../../constants';
import {AccountsTab} from '../../../../../constants/accounts/accounts';
import {openCreateModal} from '../../../../../store/actions/accounts/editor';
import {makeRoutedURL} from '../../../../../store/location';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {selectActiveAccount} from '../../../../../store/selectors/accounts/accounts-ts';
import {selectCluster} from '../../../../../store/selectors/global';
import {selectCurrentClusterConfig} from '../../../../../store/selectors/global/cluster';
import {selectIsAdmin} from '../../../../../store/selectors/global/is-developer';
import UIFactory from '../../../../../UIFactory';
import i18n from './i18n';

interface Props {
    className?: string;
}

function AccountCreate({className}: Props) {
    const currentAccount = useSelector(selectActiveAccount);
    const cluster = useSelector(selectCluster);
    const clusterConfig = useSelector(selectCurrentClusterConfig);
    const isDeveloper = useSelector(selectIsAdmin);

    const dispatch = useDispatch();
    const history = useHistory();

    const {disableCreate, disableCreateNotice} =
        UIFactory.isAccountCreateDisabled({
            currentAccount,
            clusterConfig,
            isDeveloper,
        }) ?? {};

    const handleClick = React.useCallback(() => {
        const generalPath = `/${cluster}/${Page.ACCOUNTS}/${AccountsTab.GENERAL}`;
        if (history.location.pathname !== generalPath) {
            history.push(makeRoutedURL(generalPath));
        }
        dispatch(openCreateModal());
    }, [cluster, dispatch, history]);

    return (
        <span className={className}>
            <Tooltip content={disableCreate && disableCreateNotice}>
                <Flex gap={1} alignItems="center">
                    <Button
                        view="action"
                        title={i18n('title_create-account')}
                        onClick={handleClick}
                        disabled={disableCreate}
                    >
                        {i18n('title_create-account')}
                    </Button>
                    {disableCreate && Boolean(disableCreateNotice) && <Icon data={CircleInfo} />}
                </Flex>
            </Tooltip>
        </span>
    );
}

export default AccountCreate;
