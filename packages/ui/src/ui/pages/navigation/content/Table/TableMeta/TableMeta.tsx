import React, {useMemo} from 'react';
import cn from 'bem-cn-lite';
import {connect} from 'react-redux';
import {useSelector} from '../../../../../store/redux-hooks';
import ypath from '../../../../../common/thor/ypath';

import CollapsibleSection from '../../../../../components/CollapsibleSection/CollapsibleSection';
import {ytComponentsNavigationMetaConfig} from '../../../../../components/MetaTable/ytComponentsNavigationMetaConfig';
import {MetaTable, makeMetaItems} from '@ytsaurus/components';
import {RemountAlert} from '../RemountAlert/RemountAlert';

import {selectTableType} from '../../../../../store/selectors/navigation/content/table';
import {selectIsDynamic} from '../../../../../store/selectors/navigation/content/table-ts';
import {
    selectAttributes,
    selectAttributesWithTypes,
    selectPath,
    selectTransaction,
} from '../../../../../store/selectors/navigation';
import {selectTabletErrorsBackgroundCount} from '../../../../../store/selectors/navigation/tabs/tablet-errors-background';
import {type Props as AutomaticModeSwitchProps} from './AutomaticModeSwitch';

import {type RootState} from '../../../../../store/reducers';
import {selectCluster, selectCurrentUserName} from '../../../../../store/selectors/global';

import {UI_COLLAPSIBLE_SIZE} from '../../../../../constants/global';

import './TableMeta.scss';
import {useTableAccessMetaItem} from '../table-hooks/useTableAccessMetaItem';
import i18n from './i18n';

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
    const tabletErrorCount = useSelector(selectTabletErrorsBackgroundCount);
    const cluster = useSelector(selectCluster);

    const path = useSelector(selectPath);
    const transaction_id = useSelector(selectTransaction);
    const user = useSelector(selectCurrentUserName);

    const accessItem = useTableAccessMetaItem({path, transaction_id, user});

    const items = useMemo(() => {
        const res = makeMetaItems({
            cluster,
            attributes,
            tableType,
            isDynamic,
            mediumList,
            tabletErrorCount,
            onEditEnableReplicatedTableTracker,
            navigationTableConfig: ytComponentsNavigationMetaConfig,
        });
        if (accessItem) {
            res[0].push(accessItem);
        }

        return res;
    }, [
        accessItem,
        cluster,
        attributes,
        tableType,
        isDynamic,
        mediumList,
        tabletErrorCount,
        onEditEnableReplicatedTableTracker,
    ]);

    return (
        <CollapsibleSection name={i18n('title_metadata')} size={UI_COLLAPSIBLE_SIZE}>
            <MetaTable className={block()} items={items} />
            {remountNeeded && <RemountAlert />}
        </CollapsibleSection>
    );
}

const mapStateToProps = (state: RootState) => {
    const {mediumList} = state.global;

    const isDynamic = selectIsDynamic(state);
    const tableType = selectTableType(state);
    const attributes = selectAttributes(state);
    const attributesWithTypes = selectAttributesWithTypes(state);

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
