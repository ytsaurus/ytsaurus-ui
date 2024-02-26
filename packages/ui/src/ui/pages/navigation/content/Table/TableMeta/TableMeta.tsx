import React, {useMemo} from 'react';
import cn from 'bem-cn-lite';
import {connect, useSelector} from 'react-redux';

import {
    dynTableInfo,
    replicatedTableTracker,
    tableSize,
    tableStorage,
} from '../../../../../components/MetaTable/presets/presets';
import CollapsibleSection from '../../../../../components/CollapsibleSection/CollapsibleSection';
import MetaTable from '../../../../../components/MetaTable/MetaTable';

import {getTableType} from '../../../../../store/selectors/navigation/content/table';
import {getIsDynamic} from '../../../../../store/selectors/navigation/content/table-ts';
import {getAttributes} from '../../../../../store/selectors/navigation';
import {getTabletErrorsCount} from '../../../../../store/selectors/navigation/tabs/tablet-errors';
import {Props as AutomaticModeSwitchProps} from './AutomaticModeSwitch';

import {CypressNodeTypes} from '../../../../../utils/cypress-attributes';
import {getCluster} from '../../../../../store/selectors/global';

import './TableMeta.scss';
import {main} from '../../../../../components/MetaTable/presets';
import {getCommonFields} from './commonFields';
import ypath from '../../../../../common/thor/ypath';
import {RootState} from '../../../../../store/reducers';
import {UI_COLLAPSIBLE_SIZE} from '../../../../../constants/global';

const block = cn('navigation-meta-table');

interface Props {
    attributes: any;
    mediumList: string[];
    isDynamic: boolean;
    tableType: string;
    onEditEnableReplicatedTableTracker: AutomaticModeSwitchProps['onEdit'];
}

function TableMeta({
    attributes,
    mediumList,
    isDynamic,
    tableType,
    onEditEnableReplicatedTableTracker,
}: Props) {
    const type = ypath.getValue(attributes, '/type');

    const tabletErrorCount = useSelector(getTabletErrorsCount);
    const cluster = useSelector(getCluster);

    const cf = useMemo(
        () =>
            getCommonFields({
                cluster,
                attributes,
                isDynamic,
                tableType,
                tabletErrorCount,
                onEditEnableReplicatedTableTracker,
            }),
        [
            cluster,
            attributes,
            isDynamic,
            onEditEnableReplicatedTableTracker,
            tableType,
            tabletErrorCount,
        ],
    );

    const items = useMemo(() => {
        switch (type) {
            case CypressNodeTypes.REPLICATED_TABLE:
            case CypressNodeTypes.REPLICATION_LOG_TABLE:
                return [
                    main(attributes),
                    tableSize(attributes, isDynamic, mediumList),
                    tableStorage(attributes, tableType),
                    [
                        cf.sorted,
                        ...dynTableInfo(attributes, cluster, tabletErrorCount),
                        cf.automaticModeSwitch,
                    ],
                ];

            case CypressNodeTypes.CHAOS_REPLICATED_TABLE:
                return [
                    main(attributes),
                    tableSize(attributes, isDynamic, mediumList),
                    [
                        cf.tableType,
                        replicatedTableTracker(attributes),
                        cf.sorted,
                        cf.chaosCellBundle,
                        cf.automaticModeSwitch,
                    ],
                ];

            default:
                return [
                    main(attributes),
                    tableSize(attributes, isDynamic, mediumList),
                    tableStorage(attributes, tableType),
                    [
                        cf.sorted,
                        ...(isDynamic ? dynTableInfo(attributes, cluster, tabletErrorCount) : []),
                    ],
                ];
        }
    }, [type, attributes, isDynamic, mediumList, tableType, cf, cluster, tabletErrorCount]);

    return (
        <CollapsibleSection name="Metadata" size={UI_COLLAPSIBLE_SIZE}>
            <MetaTable className={block()} items={items} />
        </CollapsibleSection>
    );
}

const mapStateToProps = (state: RootState) => {
    const {mediumList} = state.global;

    const isDynamic = getIsDynamic(state);
    const tableType = getTableType(state);
    const attributes = getAttributes(state);

    return {
        attributes,
        mediumList,
        isDynamic,
        tableType,
    };
};

export default connect(mapStateToProps)(TableMeta);
