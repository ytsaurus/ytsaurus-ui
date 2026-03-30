import React from 'react';
import {useSelector} from '../../../../../store/redux-hooks';

import {
    selectEditableAccount,
    selectIsEditableAccountOfTopLevel,
} from '../../../../../store/selectors/accounts/accounts-ts';
import UIFactory from '../../../../../UIFactory';
import {selectClusterUiConfig} from '../../../../../store/selectors/global';

function AccountTransferQuotaMessage() {
    const isTopLevel = useSelector(selectIsEditableAccountOfTopLevel);
    const account = useSelector(selectEditableAccount);
    const clusterUiConfig = useSelector(selectClusterUiConfig);

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
