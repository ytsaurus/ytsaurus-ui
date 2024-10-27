import React, {useMemo} from 'react';
import cn from 'bem-cn-lite';
import {connect, useSelector} from 'react-redux';

import {makeMetaItems} from '../../../../../components/MetaTable/presets/presets';
import CollapsibleSection from '../../../../../components/CollapsibleSection/CollapsibleSection';
import MetaTable from '../../../../../components/MetaTable/MetaTable';

import {getTableType} from '../../../../../store/selectors/navigation/content/table';
import {getIsDynamic} from '../../../../../store/selectors/navigation/content/table-ts';
import {getAttributes} from '../../../../../store/selectors/navigation';
import {getTabletErrorsBackgroundCount} from '../../../../../store/selectors/navigation/tabs/tablet-errors';
import {Props as AutomaticModeSwitchProps} from './AutomaticModeSwitch';

import {getCluster} from '../../../../../store/selectors/global';

import './TableMeta.scss';
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
    tableType,
    mediumList,
    isDynamic,
    onEditEnableReplicatedTableTracker,
}: Props) {
    const tabletErrorCount = useSelector(getTabletErrorsBackgroundCount);
    const cluster = useSelector(getCluster);

    const items = useMemo(() => {
        return makeMetaItems({
            cluster,
            attributes,
            tableType,
            isDynamic,
            mediumList,
            tabletErrorCount,
            onEditEnableReplicatedTableTracker,
        });
    }, [
        cluster,
        attributes,
        tableType,
        isDynamic,
        mediumList,
        tabletErrorCount,
        onEditEnableReplicatedTableTracker,
    ]);

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
