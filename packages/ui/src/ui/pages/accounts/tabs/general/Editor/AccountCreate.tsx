import {CircleInfo} from '@gravity-ui/icons';
import {Flex, Icon} from '@gravity-ui/uikit';
import React from 'react';
import Button from '../../../../../components/Button/Button';
import {Tooltip} from '@ytsaurus/components';
import AccountCreateDialog from '../../../../../pages/accounts/tabs/general/Editor/AccountCreateDialog';
import {openCreateModal} from '../../../../../store/actions/accounts/editor';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {getActiveAccount} from '../../../../../store/selectors/accounts/accounts-ts';
import {selectCurrentClusterConfig} from '../../../../../store/selectors/global/cluster';
import {selectIsAdmin} from '../../../../../store/selectors/global/is-developer';
import UIFactory from '../../../../../UIFactory';

interface Props {
    className?: string;
}

function AccountCreate({className}: Props) {
    const currentAccount = useSelector(getActiveAccount);
    const clusterConfig = useSelector(selectCurrentClusterConfig);
    const isDeveloper = useSelector(selectIsAdmin);

    const dispatch = useDispatch();

    const {disableCreate, disableCreateNotice} =
        UIFactory.isAccountCreateDisabled({
            currentAccount,
            clusterConfig,
            isDeveloper,
        }) ?? {};

    return (
        <span className={className}>
            <Tooltip content={disableCreate && disableCreateNotice}>
                <Flex gap={1} alignItems="center">
                    <Button
                        view="action"
                        title="Create account"
                        onClick={() => dispatch(openCreateModal())}
                        disabled={disableCreate}
                    >
                        Create account
                    </Button>
                    {disableCreate && Boolean(disableCreateNotice) && <Icon data={CircleInfo} />}
                </Flex>
            </Tooltip>
            <AccountCreateDialog />
        </span>
    );
}

export default AccountCreate;
