import React, {Component} from 'react';
import cn from 'bem-cn-lite';

import AccountQuota from '../../../../AccountQuota/AccountQuota';
import {AccountResourceName} from '../../../../../../constants/accounts/accounts';
import {RootState} from '../../../../../../store/reducers';
import {
    getCluster,
    getClusterUiConfigBundleAccountingHelpLink,
    getClusterUiConfigEnablePerAccountTabletAccounting,
    getClusterUiConfigEnablePerBundleTabletAccounting,
} from '../../../../../../store/selectors/global';
import {ConnectedProps, connect, useSelector} from 'react-redux';
import Link from '../../../../../../components/Link/Link';
import {Page} from '../../../../../../constants';

import './TabletsContent.scss';
import AccountTransferQuotaMessage from '../AccountTransferQuotaMessage';

const block = cn('accounts-editor-tablets');

interface Props {
    account: {
        name: string;
    };
}

class TabletsContent extends Component<Props & ConnectedProps<typeof connector>> {
    renderTabletsQuota() {
        const {account} = this.props;

        return (
            <AccountQuota
                title={'Tablets'}
                type={AccountResourceName.TABLET_COUNT}
                currentAccount={account.name}
            />
        );
    }

    renderTabletsMemory() {
        const {account} = this.props;

        return (
            <AccountQuota
                title={'Tablet static memory'}
                type={AccountResourceName.TABLET_STATIC_MEMORY}
                currentAccount={account.name}
            />
        );
    }

    render() {
        const {allowTabletAccounting} = this.props;
        return (
            <div className="elements-section">
                <AccountTransferQuotaMessage />
                {allowTabletAccounting && this.renderTabletsQuota()}
                {allowTabletAccounting && this.renderTabletsMemory()}
                <TabletAccountingNotice />
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => {
    return {
        allowTabletAccounting: getClusterUiConfigEnablePerAccountTabletAccounting(state),
    };
};

const connector = connect(mapStateToProps);

export default connector(TabletsContent);

export function TabletAccountingNotice({className}: {className?: string}) {
    const allowPerTablet = useSelector(getClusterUiConfigEnablePerBundleTabletAccounting);

    const helpLink = useSelector(getClusterUiConfigBundleAccountingHelpLink);
    const cluster = useSelector(getCluster);

    return !allowPerTablet ? null : (
        <div className={className}>
            <div className={block('warning')}>
                Tablet resource accounting (tablet count and tablet static memory) has been moved
                from accounts to{' '}
                <Link url={`/${cluster}/${Page.TABLET_CELL_BUNDLES}`} routed>
                    tablet cell bundles
                </Link>
                .
            </div>
            {helpLink && (
                <div>
                    <Link url={helpLink}>More details</Link>
                </div>
            )}
        </div>
    );
}
