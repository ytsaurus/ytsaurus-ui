import React from 'react';
import cn from 'bem-cn-lite';

import {
    selectCluster,
    selectClusterUiConfigBundleAccountingHelpLink,
    selectClusterUiConfigEnablePerBundleTabletAccounting,
} from '../../../../../../store/selectors/global';
import {useSelector} from '../../../../../../store/redux-hooks';
import Link from '../../../../../../containers/Link/Link';
import {Page} from '../../../../../../constants';

import './TabletsContent.scss';
import i18n from './i18n';

const block = cn('accounts-editor-tablets');

export function TabletAccountingNotice({className}: {className?: string}) {
    const allowPerTablet = useSelector(selectClusterUiConfigEnablePerBundleTabletAccounting);

    const helpLink = useSelector(selectClusterUiConfigBundleAccountingHelpLink);
    const cluster = useSelector(selectCluster);

    return !allowPerTablet ? null : (
        <div className={className}>
            <div className={block('warning')}>
                {i18n('context_tablet-accounting-moved')}{' '}
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
