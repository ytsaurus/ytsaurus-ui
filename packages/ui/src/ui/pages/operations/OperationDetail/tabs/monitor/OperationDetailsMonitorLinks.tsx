import React from 'react';
import cn from 'bem-cn-lite';
import type {OperationMonitoringTabProps} from '../../../../../UIFactory';
import {uiSettings} from '../../../../../config/ui-settings';
import Icon from '../../../../../components/Icon/Icon';
import Link from '../../../../../components/Link/Link';
import Error from '../../../../../components/Error/Error';
import MetaTable, {MetaTableItem} from '../../../../../components/MetaTable/MetaTable';
import {OperationPool} from '../../../../../components/OperationPool/OperationPool';
import {operationMonitoringUrl} from '../../../../../utils/operations/details-ts';

const block = cn('operation-detail-monitor-links');

function OperationDetailsMonitorLinks(props: OperationMonitoringTabProps) {
    const {operation, cluster} = props;
    const {pools = []} = operation ?? {};
    const {operationsMonitoring: {urlTemplate, title} = {}} = uiSettings;

    if (!urlTemplate) {
        return (
            <Error
                message={
                    'Unexpected behavior: uiSettings.operationsMonitoring.urlTemplate is not defined.'
                }
            />
        );
    }

    const items: Array<MetaTableItem> = pools.map(({pool, tree, slotIndex}, index) => {
        return {
            key: String(index),
            label: (<OperationPool cluster={cluster} pool={{pool, tree}} />) as any,
            value: (
                <Link
                    url={operationMonitoringUrl({
                        cluster,
                        operation,
                        pool,
                        tree,
                        slotIndex,
                        urlTemplate,
                    })}
                >
                    {title ?? 'Monitoring'} <Icon awesome="external-link" />
                </Link>
            ),
        };
    });

    return (
        <div className={block()}>
            <MetaTable items={items} />
        </div>
    );
}

export default React.memo(OperationDetailsMonitorLinks);
