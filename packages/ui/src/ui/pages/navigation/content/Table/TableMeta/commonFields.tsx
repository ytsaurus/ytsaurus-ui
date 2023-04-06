import React from 'react';
import ypath from '../../../../../common/thor/ypath';
import Link from '../../../../../components/Link/Link';
import AutomaticModeSwitch, {Props as AutomaticModeSwitchProps} from './AutomaticModeSwitch';
import reduce from 'lodash/reduce';
import {MetaTableItem} from '../../../../../components/MetaTable/MetaTable';
import {tabletActiveChaosBundleLink} from '../../../../../utils/components/tablet-cells';

export const getCommonFields = ({
    cluster,
    attributes,
    tableType,
    onEditEnableReplicatedTableTracker,
}: {
    cluster: string;
    attributes: any;
    isDynamic: boolean;
    tableType: string;
    tabletErrorCount: number;
    onEditEnableReplicatedTableTracker: AutomaticModeSwitchProps['onEdit'];
}) => {
    const [sorted, chaosCellBundle, enable_replicated_table_tracker] = ypath.getValues(attributes, [
        '/sorted',
        '/chaos_cell_bundle',
        '/replicated_table_options/enable_replicated_table_tracker',
    ]);

    const chaosUrl = tabletActiveChaosBundleLink(cluster, chaosCellBundle);

    const fields = [
        {
            key: 'tableType',
            label: 'Table type',
            value: tableType,
        },
        {
            key: 'sorted',
            value: sorted,
            visible: sorted !== undefined,
        },
        {
            key: 'chaosCellBundle',
            label: 'Chaos cell bundle',
            value: (
                <Link theme={'primary'} routed url={chaosUrl}>
                    {chaosCellBundle}
                </Link>
            ),
        },
        {
            key: 'automaticModeSwitch',
            label: 'Table automatic mode switch',
            value: (
                <AutomaticModeSwitch
                    value={enable_replicated_table_tracker}
                    onEdit={onEditEnableReplicatedTableTracker}
                />
            ),
        },
    ] as const;

    type Fields = typeof fields;

    const commonFields = reduce(
        fields,
        (acc, item) => {
            acc[item.key] = item;
            return acc;
        },
        {} as Record<Fields[number]['key'], MetaTableItem>,
    );

    return commonFields;
};
