import React from 'react';
import {renderDocHelpLink} from '../../../../../components/HelpLink/renderDocHelpLink';
import {useSelector} from '../../../../../store/redux-hooks';

import {selectPath} from '../../../../../store/selectors/navigation';
import {selectCluster} from '../../../../../store/selectors/global';
import Icon from '../../../../../components/Icon/Icon';
import {Secondary, Tooltip, Warning} from '@ytsaurus/components';
import {selectNavigationTableDataLensButtonAlerts} from '../../../../../store/selectors/navigation/content/table-ts';
import {Button} from '@gravity-ui/uikit';
import {selectNavigationPathAttributesLoadState} from '../../../../../store/selectors/navigation/navigation';
import {LOADING_STATUS} from '../../../../../constants';
import {uiSettings} from '../../../../../config/ui-settings';
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
            view="outlined-info"
            target="_blank"
            title={i18n('action_create-dataset-in-datalens')}
            disabled={!loaded || showTooltip}
        >
            DataLens
            <Icon awesome="external-link" size={13} />
        </Button>
    );

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
                            {renderDocHelpLink({
                                docKey: 'chyt:yt_tables#dynamic',
                                text: i18n('action_help'),
                                hideIcon: true,
                            })}
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
