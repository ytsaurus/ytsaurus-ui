import {ypath} from '../../../../utils';
import {Link, Switch, SwitchProps} from '@gravity-ui/uikit';
import reduce_ from 'lodash/reduce';
import {tabletActiveChaosBundleLink} from './tabletActiveChaosBundleLink';

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
}: {
    cluster: string;
    attributes: any;
    isDynamic: boolean;
    tableType: string;
    tabletErrorCount: number;
    onEditEnableReplicatedTableTracker: SwitchProps['onUpdate'];
}) => {
    const [sorted, chaosCellBundle, enableReplicatedTableTracker] = ypath.getValues(attributes, [
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
                <Link view={'primary'} href={chaosUrl}>
                    {chaosCellBundle}
                </Link>
            ),
        },
        {
            key: 'automaticModeSwitch',
            label: 'Table automatic mode switch',
            value: (
                <Switch
                    checked={enableReplicatedTableTracker}
                    onUpdate={onEditEnableReplicatedTableTracker}
                    title={enableReplicatedTableTracker ? 'Enabled' : 'Disabled'}
                />
            ),
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
