import React, {Component} from 'react';
import AccountQuota from '../../../../AccountQuota/AccountQuota';
import {AccountResourceName} from '../../../../../../constants/accounts/accounts';
import AccountTransferQuotaMessage from '../AccountTransferQuotaMessage';
import i18n from './i18n';
import {ResourceWarning} from './ResourceWarning';

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
                <ResourceWarning accountName={account.name} />
                <AccountTransferQuotaMessage />
                <AccountQuota
                    title={i18n('field_chunks')}
                    currentAccount={account.name}
                    type={AccountResourceName.CHUNK_COUNT}
                />
            </div>
        );
    }
}
