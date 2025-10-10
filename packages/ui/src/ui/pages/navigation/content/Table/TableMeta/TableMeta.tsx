import React, {useMemo} from 'react';
import cn from 'bem-cn-lite';
import {connect} from 'react-redux';
import {useSelector} from '../../../../../store/redux-hooks';
import ypath from '../../../../../common/thor/ypath';

import {makeMetaItems} from '../../../../../components/MetaTable/presets/presets';
import CollapsibleSection from '../../../../../components/CollapsibleSection/CollapsibleSection';
import MetaTable from '../../../../../components/MetaTable/MetaTable';
import {RemountAlert} from '../RemountAlert/RemountAlert';

import {getTableType} from '../../../../../store/selectors/navigation/content/table';
import {getIsDynamic} from '../../../../../store/selectors/navigation/content/table-ts';
import {getAttributes, getAttributesWithTypes} from '../../../../../store/selectors/navigation';
import {getTabletErrorsBackgroundCount} from '../../../../../store/selectors/navigation/tabs/tablet-errors-background';
import {Props as AutomaticModeSwitchProps} from './AutomaticModeSwitch';

import {RootState} from '../../../../../store/reducers';
import {getCluster} from '../../../../../store/selectors/global';

import {UI_COLLAPSIBLE_SIZE} from '../../../../../constants/global';

import './TableMeta.scss';

const block = cn('navigation-meta-table');

interface Props {
    attributes: any;
    mediumList: string[];
    isDynamic: boolean;
    tableType: string;
    remountNeeded: boolean;
    onEditEnableReplicatedTableTracker: AutomaticModeSwitchProps['onEdit'];
}

function TableMeta({
    attributes,
    tableType,
    mediumList,
    isDynamic,
    remountNeeded,
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
            {remountNeeded && <RemountAlert />}
        </CollapsibleSection>
    );
}

const mapStateToProps = (state: RootState) => {
    const {mediumList} = state.global;

    const isDynamic = getIsDynamic(state);
    const tableType = getTableType(state);
    const attributes = getAttributes(state);
    const attributesWithTypes = getAttributesWithTypes(state);

    const remountNeeded =
        Boolean(Number(ypath.getValue(attributesWithTypes, '/remount_needed_tablet_count'))) &&
        isDynamic;

    return {
        attributes,
        mediumList,
        isDynamic,
        tableType,
        remountNeeded,
    };
};

export default connect(mapStateToProps)(TableMeta);
