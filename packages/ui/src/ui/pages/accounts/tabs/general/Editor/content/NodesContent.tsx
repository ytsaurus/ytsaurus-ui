import React, {Component} from 'react';

import AccountQuota from '../../../../AccountQuota/AccountQuota';
import {AccountResourceName} from '../../../../../../constants/accounts/accounts';
import AccountTransferQuotaMessage from '../AccountTransferQuotaMessage';

interface Props {
    account: {
        name: string;
    };
}

export default class NodesContent extends Component<Props> {
    render() {
        const {account} = this.props;

        return (
            <div className="elements-section">
                <AccountTransferQuotaMessage />
                <AccountQuota
                    title={'Nodes'}
                    currentAccount={account.name}
                    type={AccountResourceName.NODE_COUNT}
                />
            </div>
        );
    }
}
