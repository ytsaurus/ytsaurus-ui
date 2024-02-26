import React, {Component} from 'react';
import {compose} from 'redux';
import {connect, useDispatch} from 'react-redux';
import hammer from '../../../common/hammer';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';
import _ from 'lodash';

import {CollapsibleSectionStateLess} from '../../../components/CollapsibleSection/CollapsibleSection';
import withStickyFooter from '../../../components/ElementsTable/hocs/withStickyFooter';
import {sortStateType} from '../../../components/ElementsTable/ElementsTableHeader';
import withStickyHead from '../../../components/ElementsTable/hocs/withStickyHead';
import ElementsTableBase from '../../../components/ElementsTable/ElementsTable';
import SystemCounters from '../SystemCounters/SystemCounters';
import Label from '../../../components/Label/Label';

import {SYSTEM_CHUNKS_TABLE_ID} from '../../../constants/tables';
import {loadChunks} from '../../../store/actions/system/chunks';
import {getSettingsSystemChunksCollapsed} from '../../../store/selectors/settings-ts';
import {setSettingsSystemChunksCollapsed} from '../../../store/actions/settings/settings';
import {useUpdater} from '../../../hooks/use-updater';

import './Chunks.scss';
import {UI_COLLAPSIBLE_SIZE} from '../../../constants/global';

const b = block('system');

const ElementsTable = compose(withStickyHead, withStickyFooter)(ElementsTableBase);

class Chunks extends Component {
    static _formatChunkName(name) {
        return hammer.format['ReadableField'](
            name === 'chunks' ? 'total' : name.substring(0, name.length - '_chunks'.length),
        );
    }

    static _formatChunkCount(count) {
        return count === 0 ? '' : hammer.format['Number'](count);
    }

    static _prepareColumnSet(types) {
        let columnSet = _.map(types, 'name');

        columnSet = _.filter(columnSet, (item) => item !== 'chunks');
        columnSet.push('chunks');
        columnSet.unshift('cell_tag');

        return columnSet;
    }

    static propTypes = {
        // from connect
        replication: PropTypes.bool,
        sealer: PropTypes.bool,
        refresh: PropTypes.bool,
        requisitionUpdate: PropTypes.bool,
        cells: PropTypes.arrayOf(PropTypes.object),
        types: PropTypes.arrayOf(PropTypes.object),

        sortState: sortStateType,
    };

    onToggle = () => {
        const {collapsed, setSettingsSystemChunksCollapsed} = this.props;
        setSettingsSystemChunksCollapsed(!collapsed);
    };

    _prepareColumns(types) {
        const columns = {};

        _.each(types, (type) => {
            columns[type.name] = _.extend(type, {
                get: function (cellData) {
                    return cellData[type.name];
                },
                caption: Chunks._formatChunkName(type.name),
                align: 'right',
                sort: true,
            });
        });

        columns.cell_tag = {
            get: function (cellData) {
                const cellTag = cellData.cell_tag;
                return cellTag === 'total' ? cellTag : Number(cellTag);
            },
            name: 'cell_tag',
            caption: hammer.format['ReadableField']('cell_tag'),
            align: 'left',
            sort: true,
        };

        return columns;
    }

    renderLabels() {
        const {replication, sealer, refresh, requisitionUpdate} = this.props;

        const labels = [
            {
                text: 'Replication',
                value: replication,
            },
            {
                text: 'Sealer',
                value: sealer,
            },
            {
                text: 'Refresh',
                value: refresh,
            },
            {
                text: 'Requisition Update',
                value: requisitionUpdate,
            },
        ];

        return _.map(labels, (label) => {
            let theme, text;

            if (typeof label.value === 'boolean') {
                theme = label.value ? 'success' : 'danger';
                text = label.value ? `${label.text} enabled` : `${label.text} disabled`;
            } else {
                theme = 'default';
                text = `${label.text} unknown`;
            }

            return <Label key={label.text} theme={theme} text={text} />;
        });
    }

    renderImpl() {
        const {cells, types, sortState, collapsibleSize, collapsed} = this.props;
        const [rest, total] = _.partition(cells, ({cell_tag}) => 'total' !== cell_tag);

        if (!cells || 0 === cells.length) {
            return null;
        }

        const columns = this._prepareColumns(types);
        const sortedCells = hammer.utils.sort(rest, sortState, columns);

        // TABLE
        const tableSettings = {
            size: 's',
            theme: 'embedded',
            striped: false,
            css: 'chunk-cells',
            computeKey: function (item) {
                return item.cell_tag;
            },
            tableId: SYSTEM_CHUNKS_TABLE_ID,
            columns: {
                items: columns,
                sets: {
                    default: {
                        items: Chunks._prepareColumnSet(types),
                    },
                },
            },
            templates: {
                key: 'system/chunk-cells',
                data: {columns: columns},
            },
            header: false,
        };

        const table = Object.assign({}, tableSettings, {
            items: sortedCells,
            columns: Object.assign({}, tableSettings.columns, {
                items: columns,
                mode: 'default',
            }),
        });

        const totalRow = total[0];

        let countersBlock = null;
        if (totalRow) {
            /* eslint-disable camelcase */
            const {
                lost_vital_chunks,
                data_missing_chunks,
                parity_missing_chunks,
                chunks,
                quorum_missing_chunks,
            } = totalRow;

            const counters = {
                flags: {
                    lvc: Chunks._formatChunkCount(lost_vital_chunks),
                    dmc: Chunks._formatChunkCount(data_missing_chunks),
                    pmc: Chunks._formatChunkCount(parity_missing_chunks),
                    qmc: Chunks._formatChunkCount(quorum_missing_chunks),
                },
                total: hammer.format['Number'](chunks),
            };
            /* eslint-enable camelcase */
            const stateThemeMappings = {
                lvc: 'danger',
                dmc: 'warning',
                pmc: 'warning',
                qmc: 'danger',
            };
            countersBlock = (
                <SystemCounters
                    counters={counters}
                    renderLinks={false}
                    stateThemeMappings={stateThemeMappings}
                />
            );
        }

        const overview = (
            <div className={b('heading-overview')}>
                {countersBlock}
                {this.renderLabels()}
            </div>
        );

        return (
            <CollapsibleSectionStateLess
                name={'Chunks'}
                overview={overview}
                onToggle={this.onToggle}
                collapsed={collapsed}
                size={collapsibleSize}
            >
                <div className={b('chunks')}>
                    <ElementsTable {...table} footer={totalRow} />
                </div>
            </CollapsibleSectionStateLess>
        );
    }

    render() {
        return (
            <React.Fragment>
                <ChunksUpdater />
                {this.renderImpl()}
            </React.Fragment>
        );
    }
}

function mapStateToProps(state) {
    const {replication, sealer, refresh, requisitionUpdate, cells, types} = state.system.chunks;

    return {
        replication,
        sealer,
        refresh,
        requisitionUpdate,
        cells,
        types,
        sortState: state.tables[SYSTEM_CHUNKS_TABLE_ID],
        collapsibleSize: UI_COLLAPSIBLE_SIZE,
        collapsed: getSettingsSystemChunksCollapsed(state),
    };
}

const mapDispatchToProps = {
    setSettingsSystemChunksCollapsed,
};

function ChunksUpdater() {
    const dispatch = useDispatch();

    const updateFn = React.useMemo(() => {
        let allowRetry = true;
        return () => {
            if (allowRetry) {
                dispatch(loadChunks()).then(({isRetryFutile} = {}) => {
                    if (isRetryFutile) {
                        allowRetry = false;
                    }
                });
            }
        };
    }, [dispatch]);

    useUpdater(updateFn);

    return null;
}

export default connect(mapStateToProps, mapDispatchToProps)(Chunks);
