import React, {Component} from 'react';
import cn from 'bem-cn-lite';

import AccountQuota from '../../../../AccountQuota/AccountQuota';
import {AccountResourceName} from '../../../../../../constants/accounts/accounts';
import {type RootState} from '../../../../../../store/reducers';
import {
    selectCluster,
    selectClusterUiConfigBundleAccountingHelpLink,
    selectClusterUiConfigEnablePerAccountTabletAccounting,
    selectClusterUiConfigEnablePerBundleTabletAccounting,
} from '../../../../../../store/selectors/global';
import {type ConnectedProps, connect} from 'react-redux';
import {useSelector} from '../../../../../../store/redux-hooks';
import Link from '../../../../../../components/Link/Link';
import {Page} from '../../../../../../constants';

import './TabletsContent.scss';
import AccountTransferQuotaMessage from '../AccountTransferQuotaMessage';
import i18n from './i18n';

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
                title={i18n('field_tablets')}
                type={AccountResourceName.TABLET_COUNT}
                currentAccount={account.name}
            />
        );
    }

    renderTabletsMemory() {
        const {account} = this.props;

        return (
            <AccountQuota
                title={i18n('field_tablet-static-memory')}
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
        allowTabletAccounting: selectClusterUiConfigEnablePerAccountTabletAccounting(state),
    };
};

const connector = connect(mapStateToProps);

export default connector(TabletsContent);

export function TabletAccountingNotice({className}: {className?: string}) {
    const allowPerTablet = useSelector(selectClusterUiConfigEnablePerBundleTabletAccounting);

    const helpLink = useSelector(selectClusterUiConfigBundleAccountingHelpLink);
    const cluster = useSelector(selectCluster);

    return !allowPerTablet ? null : (
        <div className={className}>
            <div className={block('warning')}>
                {i18n('context_tablet-accounting-moved')}
                <Link url={`/${cluster}/${Page.TABLET_CELL_BUNDLES}`} routed>
                    {i18n('action_tablet-cell-bundles')}
                </Link>
                .
            </div>
            {helpLink && (
                <div>
                    <Link url={helpLink}>{i18n('action_more-details')}</Link>
                </div>
            )}
        </div>
    );
}
