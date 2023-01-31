import React from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import {connect, useSelector} from 'react-redux';

import {
    compression,
    erasureReplication,
    main,
    size,
} from '../../../../../components/MetaTable/presets';
import {replicatedTableTracker} from '../../../../../components/MetaTable/presets/presets';
import CollapsibleSection from '../../../../../components/CollapsibleSection/CollapsibleSection';
import MetaTable from '../../../../../components/MetaTable/MetaTable';
import Label from '../../../../../components/Label/Label';

import {getTableType} from '../../../../../store/selectors/navigation/content/table';
import {getIsDynamic} from '../../../../../store/selectors/navigation/content/table-ts';
import {getAttributes} from '../../../../../store/selectors/navigation';
import {getTabletErrorsCount} from '../../../../../store/selectors/navigation/tabs/tablet-errors';
import hammer from '../../../../../common/hammer';

import {Popover} from '@gravity-ui/uikit';
import Icon from '../../../../../components/Icon/Icon';
import {CypressNodeTypes} from '../../../../../utils/cypress-attributes';
import Link from '../../../../../components/Link/Link';
import {tabletActiveBundleLink} from '../../../../../utils/components/tablet-cells';
import {getCluster, getUISizes} from '../../../../../store/selectors/global';

import AutomaticModeSwitch from './AutomaticModeSwitch';

import './TableMeta.scss';

const block = cn('navigation-meta-table');

function RowsCount(props) {
    const {count, isDynamic} = props;
    return (
        <React.Fragment>
            {isDynamic ? '≈ ' : ''}
            {hammer.format['Number'](count)}
            {!isDynamic ? null : (
                <Popover
                    content={
                        <span>
                            This value corresponds to the number of rows stored in the on-disk
                            chunks. The actual value may be different: it may be either larger due
                            to new rows residing only in memory or smaller due to unsynced deleted
                            rows and multiple versions stored on disks. It is not possible to
                            calculate the real value without reading all the rows.
                        </span>
                    }
                >
                    <span className={block('question')}>
                        <Icon awesome={'question-circle'} />
                    </span>
                </Popover>
            )}
        </React.Fragment>
    );
}

TableMeta.propTypes = {
    // from connect
    isDynamic: PropTypes.bool.isRequired,
    tableType: PropTypes.string.isRequired,
    attributes: PropTypes.object.isRequired,
    mediumList: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

function TableMeta({
    attributes,
    mediumList,
    isDynamic,
    tableType,
    collapsibleSize,
    onEditEnableReplicatedTableTracker,
}) {
    const [
        rowCount,
        chunkCount,
        dataWeight,
        sorted,
        tabletCellBundle,
        optimizeFor,
        tabletState,
        inMemoryMode,
        type,
        enable_replicated_table_tracker,
    ] = ypath.getValues(attributes, [
        '/chunk_row_count',
        '/chunk_count',
        '/data_weight',
        '/sorted',
        '/tablet_cell_bundle',
        '/optimize_for',
        '/tablet_state',
        '/in_memory_mode',
        '/type',
        '/replicated_table_options/enable_replicated_table_tracker',
    ]);

    const tabletErrorCount = useSelector(getTabletErrorsCount);
    const cluster = useSelector(getCluster);
    const tabletUrl = tabletActiveBundleLink(cluster, tabletCellBundle);

    const isReplicatedTable = type === CypressNodeTypes.REPLICATED_TABLE;

    return (
        <CollapsibleSection name="Metadata" size={collapsibleSize}>
            <MetaTable
                className={block()}
                items={[
                    main(attributes),
                    [
                        {
                            key: 'rows',
                            value: <RowsCount isDynamic={isDynamic} count={rowCount} />,
                        },
                        {
                            key: 'chunks',
                            value: hammer.format['Number'](chunkCount),
                        },
                        ...size(attributes, mediumList),
                        {
                            key: 'data weight',
                            value: hammer.format['Bytes'](dataWeight),
                            visible: Boolean(dataWeight),
                        },
                    ],
                    [
                        {
                            key: 'table type',
                            value: tableType,
                        },
                        {
                            key: 'optimize for',
                            value: (
                                <Label
                                    text={hammer.format['ReadableField'](optimizeFor)}
                                    theme="info"
                                />
                            ),
                            visible: optimizeFor !== 'undefined',
                        },
                        ...compression(attributes),
                        ...erasureReplication(attributes),
                        replicatedTableTracker(attributes),
                    ],
                    [
                        {
                            key: 'sorted',
                            value: sorted,
                        },
                        {
                            key: 'tablet cell bundle',
                            value: (
                                <Link theme={'primary'} routed url={tabletUrl}>
                                    {tabletCellBundle}
                                </Link>
                            ),
                            visible: isDynamic,
                        },
                        {
                            key: 'tablet state',
                            value: (
                                <Label
                                    theme={tabletState === 'mounted' ? 'info' : 'default'}
                                    text={hammer.format['ReadableField'](tabletState)}
                                />
                            ),
                            visible: isDynamic,
                        },
                        {
                            key: 'in memory mode',
                            value: (
                                <Label
                                    theme={
                                        inMemoryMode && inMemoryMode !== 'none' ? 'info' : 'default'
                                    }
                                    text={hammer.format['ReadableField'](inMemoryMode || 'none')}
                                />
                            ),
                            visible: isDynamic,
                        },
                        {
                            key: 'tablet error count',
                            value: hammer.format['Number'](tabletErrorCount),
                            visible: isDynamic,
                        },
                        {
                            key: 'Table automatic mode switch',
                            value: (
                                <AutomaticModeSwitch
                                    value={enable_replicated_table_tracker}
                                    onEdit={onEditEnableReplicatedTableTracker}
                                />
                            ),
                            visible: isReplicatedTable,
                        },
                    ],
                ]}
            />
        </CollapsibleSection>
    );
}

const mapStateToProps = (state) => {
    const {mediumList} = state.global;

    const isDynamic = getIsDynamic(state);
    const tableType = getTableType(state);
    const attributes = getAttributes(state);

    return {
        attributes,
        mediumList,
        isDynamic,
        tableType,
        collapsibleSize: getUISizes(state).collapsibleSize,
    };
};

export default connect(mapStateToProps)(TableMeta);
