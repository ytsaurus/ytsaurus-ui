import React, {Component} from 'react';
import AccountQuota from '../../../../AccountQuota/AccountQuota';
import {AccountResourceName} from '../../../../../../constants/accounts/accounts';
import AccountTransferQuotaMessage from '../AccountTransferQuotaMessage';

interface Props {
    account: {
        name: string;
    };
}

export default class ChunksContent extends Component<Props> {
    render() {
        const {account} = this.props;

        return (
            <div className="elements-section">
                <AccountTransferQuotaMessage />
                <AccountQuota
                    title={'Chunks'}
                    currentAccount={account.name}
                    type={AccountResourceName.CHUNK_COUNT}
                />
            </div>
        );
    }
}
