import {format, ypath} from '../../../../utils';
import reduce_ from 'lodash/reduce';
import type {MetaTableAutomaticModeSwitchOnEdit, YtComponentsConfig} from '../../../../context';

export interface MetaTableItem {
    key: string;
    label?: React.ReactChild;
    labelTopPadding?: string;
    value: boolean | React.ReactNode;
    icon?: React.ReactNode;
    visible?: boolean;
    helpUrl?: string;
    tooltip?: React.ReactNode;
    className?: string;
    qa?: string;
}

export const getCommonFields = ({
    cluster,
    attributes,
    tableType,
    onEditEnableReplicatedTableTracker,
    config,
}: {
    cluster: string;
    attributes: any;
    isDynamic: boolean;
    tableType: string;
    tabletErrorCount: number;
    onEditEnableReplicatedTableTracker?: MetaTableAutomaticModeSwitchOnEdit;
    config?: Partial<YtComponentsConfig>;
}) => {
    const [sorted, chaosCellBundle, enableReplicatedTableTracker] = ypath.getValues(attributes, [
        '/sorted',
        '/chaos_cell_bundle',
        '/replicated_table_options/enable_replicated_table_tracker',
    ]);

    const ChaosCellBundleLink = config?.ChaosCellBundleLink;
    const renderAutomaticModeSwitch = config?.renderMetaTableAutomaticModeSwitch;

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
            value: chaosCellBundle ? (
                ChaosCellBundleLink ? (
                    <ChaosCellBundleLink cluster={cluster} chaosCellBundle={chaosCellBundle} />
                ) : (
                    chaosCellBundle
                )
            ) : (
                format.NO_VALUE
            ),
        },
        {
            key: 'automaticModeSwitch',
            label: 'Table automatic mode switch',
            value: renderAutomaticModeSwitch?.({
                value: enableReplicatedTableTracker,
                cluster,
                onEdit: onEditEnableReplicatedTableTracker,
            }),
            visible: Boolean(renderAutomaticModeSwitch),
        },
    ] as const;

    type Fields = typeof fields;

    const commonFields = reduce_(
        fields,
        (acc, item) => {
            acc[item.key] = item;
            return acc;
        },
        {} as Record<Fields[number]['key'], MetaTableItem>,
    );

    return commonFields;
};
