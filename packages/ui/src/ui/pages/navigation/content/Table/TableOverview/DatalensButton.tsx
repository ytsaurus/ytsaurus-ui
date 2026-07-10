import React from 'react';
import {useSelector} from '../../../../../store/redux-hooks';

import {selectPath} from '../../../../../store/selectors/navigation';
import {selectCluster} from '../../../../../store/selectors/global';
import Icon from '../../../../../components/Icon/Icon';
import {Secondary, Tooltip, Warning} from '@ytsaurus/components';
import {selectNavigationTableDataLensButtonAlerts} from '../../../../../store/selectors/navigation/content/table-ts';
import {Button} from '@gravity-ui/uikit';
import Link from '../../../../../containers/Link/Link';
import {selectNavigationPathAttributesLoadState} from '../../../../../store/selectors/navigation/navigation';
import {LOADING_STATUS} from '../../../../../constants';
import {docsUrl} from '../../../../../config';
import {uiSettings} from '../../../../../config/ui-settings';
import UIFactory from '../../../../../UIFactory';
import i18n from './i18n';

export default function DataLensButton({className}: {className: string}) {
    const loaded = useSelector(selectNavigationPathAttributesLoadState) === LOADING_STATUS.LOADED;
    const cluster: string = useSelector(selectCluster);
    const path = useSelector(selectPath);
    const {isEmptySchema, enableDynamicStoreRedRequired} = useSelector(
        selectNavigationTableDataLensButtonAlerts,
    );

    const {datalensBaseUrl, datalensAllowedCluster} = uiSettings;

    if (!datalensBaseUrl || !new Set(datalensAllowedCluster).has(cluster)) {
        return null;
    }
    const showTooltip = isEmptySchema || enableDynamicStoreRedRequired;

    const url = `${datalensBaseUrl}/datasets/new?id=CHYT_${cluster.toUpperCase()}&ytPath=${path}&action=autoCreate`;

    const btn = (
        <Button
            href={url}
            view={'action'}
            target="_blank"
            title={i18n('action_create-dataset-in-datalens')}
            disabled={!loaded || showTooltip}
        >
            <Icon awesome={'chart-bar'} size={13} />
            DataLens
        </Button>
    );

    const linkUrl = UIFactory.docsUrls['chyt:yt_tables#dynamic'];
    const content = !showTooltip ? (
        btn
    ) : (
        <Tooltip
            content={
                <Warning>
                    {isEmptySchema && <div>{i18n('alert_empty-schema')}</div>}
                    {enableDynamicStoreRedRequired && (
                        <div>
                            {i18n('alert_dynamic-store-read-required-prefix')}{' '}
                            <Secondary>enable_dynamic_store_read</Secondary>{' '}
                            {i18n('alert_dynamic-store-read-required-suffix')}
                            {linkUrl !== '' &&
                                docsUrl(<Link url={linkUrl}>{i18n('action_help')}</Link>)}
                        </div>
                    )}
                </Warning>
            }
        >
            {btn}
        </Tooltip>
    );

    return <div className={className}>{content}</div>;
}
