import React from 'react';
import {useSelector} from 'react-redux';

import {getPath} from '../../../../../store/selectors/navigation';
import {getCluster} from '../../../../../store/selectors/global';
import Icon from '../../../../../components/Icon/Icon';
import {Tooltip} from '../../../../../components/Tooltip/Tooltip';
import {getNavigationTableDataLensButtonAlerts} from '../../../../../store/selectors/navigation/content/table-ts';
import {Button} from '@gravity-ui/uikit';
import {Secondary, Warning} from '../../../../../components/Text/Text';
import Link from '../../../../../components/Link/Link';
import {getNavigationPathAttributesLoadState} from '../../../../../store/selectors/navigation/navigation';
import {LOADING_STATUS} from '../../../../../constants';
import {docsUrl} from '../../../../../config';
import {uiSettings} from '../../../../../config/ui-settings';
import UIFactory from '../../../../../UIFactory';

export default function DataLensButton({className}: {className: string}) {
    const loaded = useSelector(getNavigationPathAttributesLoadState) === LOADING_STATUS.LOADED;
    const cluster: string = useSelector(getCluster);
    const path = useSelector(getPath);
    const {isEmptySchema, enableDynamicStoreRedRequired} = useSelector(
        getNavigationTableDataLensButtonAlerts,
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
            title="Create dataset in DataLens"
            disabled={!loaded || showTooltip}
        >
            <Icon awesome={'chart-bar'} />
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
                    {isEmptySchema && <div>Please make sure that the table has schema.</div>}
                    {enableDynamicStoreRedRequired && (
                        <div>
                            Please make sure that the table has enabled{' '}
                            <Secondary>enable_dynamic_store_read</Secondary> attribute.
                            {linkUrl !== '' && docsUrl(<Link url={linkUrl}> Help </Link>)}
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
