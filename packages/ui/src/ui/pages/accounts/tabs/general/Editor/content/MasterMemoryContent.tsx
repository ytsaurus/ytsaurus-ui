import React from 'react';

import map_ from 'lodash/map';

import format from '../../../../../../common/hammer/format';

import AccountQuota from '../../../../AccountQuota/AccountQuota';
import {AccountResourceName} from '../../../../../../constants/accounts/accounts';
import {getAccountMasterMemoryMedia} from '../../../../../../store/selectors/accounts/accounts-ts';
import {useSelector} from '../../../../../../store/redux-hooks';
import AccountTransferQuotaMessage from '../AccountTransferQuotaMessage';

interface Props {
    account: {
        name: string;
    };
}

export default function MasterMemoryContent(props: Props) {
    const media = useSelector(getAccountMasterMemoryMedia);
    const {account} = props;

    return (
        <div className="elements-section">
            <AccountTransferQuotaMessage />
            {map_(media, (medium) => {
                return (
                    <AccountQuota
                        key={medium}
                        title={format.Readable(medium)}
                        type={AccountResourceName.MASTER_MEMORY}
                        currentAccount={account.name}
                        mediumType={medium}
                    />
                );
            })}
        </div>
    );
}
