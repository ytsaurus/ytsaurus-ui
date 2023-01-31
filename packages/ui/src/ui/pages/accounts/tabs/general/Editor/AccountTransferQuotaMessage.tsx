import React from 'react';
import {useSelector} from 'react-redux';

import {
    getEditableAccount,
    isEditableAccountOfTopLevel,
} from '../../../../../store/selectors/accounts/accounts-ts';
import UIFactory from '../../../../../UIFactory';
import {getClusterUiConfig} from '../../../../../store/selectors/global';

function AccountTransferQuotaMessage() {
    const isTopLevel = useSelector(isEditableAccountOfTopLevel);
    const account = useSelector(getEditableAccount);
    const clusterUiConfig = useSelector(getClusterUiConfig);

    return (
        <>
            {UIFactory.renderTransferQuotaNoticeForAccount({
                isTopLevel,
                accountAttributes: account.$attributes,
                clusterUiConfig,
            })}
        </>
    );
}

export default React.memo(AccountTransferQuotaMessage);
