import {useDispatch, useSelector} from 'react-redux';
import React, {useCallback, useState} from 'react';
import hammer from '../../../common/hammer';
import PropTypes from 'prop-types';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';

import keys_ from 'lodash/keys';
import map_ from 'lodash/map';

import {Button, Dialog} from '@gravity-ui/uikit';

import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import MetaTable, {Template} from '../../../components/MetaTable/MetaTable';
import Histogram from '../../../components/Histogram/Histogram';
import {size} from '../../../components/MetaTable/presets';
import Error from '../../../components/Error/Error';
import Label from '../../../components/Label/Label';
import Yson from '../../../components/Yson/Yson';

import {histogramItems} from '../../../utils/tablet/tablet';
import {getActiveHistogram, getHistogram} from '../../../store/selectors/tablet/tablet';
import {changeActiveHistogram} from '../../../store/actions/tablet/tablet';
import {Tab as NavigationTab} from '../../../constants/navigation';
import {Page} from '../../../constants/index';
import {genTabletCellBundlesCellUrl} from '../../../utils/tablet_cell_bundles';
import StoresDialog from './StoresDialog';
import {Tooltip} from '../../../components/Tooltip/Tooltip';
import {makeComponentsNodesUrl} from '../../../utils/app-url';

function makeMetaItem(format, data, key, visible) {
    return {
        key,
        value: hammer.format[format](data[key]),
        visible,
    };
}

Overview.propTypes = {
    // from parent
    id: PropTypes.string.isRequired,
    block: PropTypes.func.isRequired,
};

const renderErrorsDialog = (errors, handleClose) => {
    const visible = errors.length > 0;

    return (
        <Dialog size="l" open={visible} onClose={handleClose} hasButtonClose autoclosable>
            <Dialog.Header caption="Tablet errors" />
            <Dialog.Body>
                {map_(errors, (err, index) => {
                    const error = {
                        ...err,
                        message: ypath.getValue(err, '/message'),
                    };
                    return <Error error={error} key={index} />;
                })}
            </Dialog.Body>
        </Dialog>
    );
};

const renderReplicationErrorsDialog = (replicationErrors, handleClose) => {
    const visible = keys_(replicationErrors).length > 0;

    return (
        <Dialog size="l" open={visible} onClose={handleClose} hasButtonClose autoclosable>
            <Dialog.Header caption="Replication errors" />
            <Dialog.Body>
                {map_(replicationErrors, (err, replica) => {
                    const error = {
                        ...err,
                        message: ypath.getValue(err, '/message'),
                    };
                    const message = `Replica ID: ${replica}`;
                    return <Error message={message} error={error} key={replica} />;
                })}
            </Dialog.Body>
        </Dialog>
    );
};

function Overview({id, block}) {
    const dispatch = useDispatch();
    const {
        attributes,
        cellLeadingPeer,
        tablePath,
        tabletPath,
        tabletErrors,
        replicationErrors,
        pivotKey,
        nextPivotKey,
        stores,
        unorderedDynamicTable,
    } = useSelector((state) => state.tablet.tablet);

    const {mediumList, cluster} = useSelector((state) => state.global);
    const [errors, setErrorsVisibility] = useState([]);
    const [replicaErrors, setReplicationErrorsVisibility] = useState({});

    const [cellId, state, index, statistics, performance] = ypath.getValues(attributes, [
        '/cell_id',
        '/state',
        '/index',
        '/statistics',
        '/performance_counters',
    ]);
    const [unmergedRowCount, chunkCount] = ypath.getValues(statistics, [
        '/unmerged_row_count',
        '/chunk_count',
    ]);

    const [storesVisible, setStoresVisible] = React.useState(false);
    const toggleStoresVisibility = React.useCallback(() => {
        setStoresVisible(!storesVisible);
    }, [stores, setStoresVisible, storesVisible]);

    const resourcesMeta = !statistics
        ? []
        : [
              makeMetaItem('Number', statistics, 'partition_count', !unorderedDynamicTable),
              {
                  key: 'store_count',
                  value: (() => {
                      const disableStoresDialog = statistics.store_count >= 200;
                      return (
                          <span>
                              {hammer.format.Number(statistics.store_count)}
                              {unorderedDynamicTable && (
                                  <>
                                      &nbsp;&nbsp;
                                      <Tooltip
                                          disabled={!disableStoresDialog}
                                          content="Too many stores to show"
                                      >
                                          <Button
                                              disabled={disableStoresDialog}
                                              view="flat-secondary"
                                              onClick={toggleStoresVisibility}
                                          >
                                              View
                                          </Button>
                                      </Tooltip>
                                  </>
                              )}
                          </span>
                      );
                  })(),
              },
              makeMetaItem('Number', statistics, 'overlapping_store_count', !unorderedDynamicTable),
              makeMetaItem('Number', statistics, 'preload_completed_store_count'),
              makeMetaItem('Number', statistics, 'preload_failed_store_count'),
              makeMetaItem('Number', statistics, 'preload_pending_store_count'),
          ];

    const performanceMeta = !performance
        ? []
        : [
              makeMetaItem('Number', performance, 'dynamic_row_read_rate'),
              makeMetaItem('Number', performance, 'dynamic_row_lookup_rate'),
              makeMetaItem('Number', performance, 'dynamic_row_write_rate'),
              makeMetaItem('Number', performance, 'dynamic_row_delete_rate'),
              makeMetaItem('Number', performance, 'static_chunk_row_read_rate'),
              makeMetaItem('Number', performance, 'static_chunk_row_lookup_rate'),
              makeMetaItem('Number', performance, 'unmerged_row_read_rate', !unorderedDynamicTable),
              makeMetaItem('Number', performance, 'merged_row_read_rate', !unorderedDynamicTable),
          ];

    const stateTheme = {
        none: 'default',
        unmounted: 'default',
        mounted: 'info',
        frozen: 'info',
        freezing: 'warning',
        unfreezing: 'warning',
        mounting: 'warning',
        unmounting: 'warning',
        mixed: 'danger',
    }[state];

    const activeHistogram = useSelector(getActiveHistogram);
    const histogram = useSelector(getHistogram);

    const handleHistogramChange = useCallback(
        (histogram) => dispatch(changeActiveHistogram(histogram)),
        [dispatch, activeHistogram],
    );
    const handleErrorsClick = useCallback(() => setErrorsVisibility(tabletErrors), [tabletErrors]);
    const handleReplicationErrorsClick = useCallback(
        () => setReplicationErrorsVisibility(replicationErrors),
        [replicationErrors],
    );

    const handleErrorsCloseClick = useCallback(() => setErrorsVisibility([]), []);
    const handleReplicationErrorsCloseClick = useCallback(
        () => setReplicationErrorsVisibility({}),
        [],
    );

    return (
        <ErrorBoundary>
            {storesVisible && (
                <StoresDialog
                    visible={true}
                    onClose={toggleStoresVisibility}
                    index={0}
                    unorderedDynamicTable={unorderedDynamicTable}
                    stores={Object.keys(stores)}
                />
            )}
            <div className={block('overview')}>
                <div className={block('meta')}>
                    <MetaTable
                        items={[
                            [
                                {
                                    key: 'id',
                                    value: <Template.Id id={id} />,
                                },
                                {
                                    key: 'tablet_cell_id',
                                    label: 'Tablet cell id',
                                    value: (
                                        <Template.Link
                                            withClipboard
                                            text={cellId}
                                            shiftText={tabletPath}
                                            hoverContent={'Hold SHIFT-key to copy full path'}
                                            url={genTabletCellBundlesCellUrl(cellId, cluster)}
                                        />
                                    ),
                                },
                                {
                                    key: 'table_path',
                                    value: (
                                        <Template.Link
                                            withClipboard
                                            text={tablePath}
                                            url={`/${cluster}/${Page.NAVIGATION}?path=${tablePath}&mode=${NavigationTab.TABLETS}`}
                                        />
                                    ),
                                },
                                {
                                    key: 'tablet cell leader node',
                                    value: (
                                        <Template.Link
                                            withClipboard
                                            text={cellLeadingPeer.address}
                                            url={makeComponentsNodesUrl({
                                                cluster,
                                                host: cellLeadingPeer.address,
                                            })}
                                        />
                                    ),
                                    visible: Boolean(cellLeadingPeer),
                                },
                                {
                                    key: 'errors',
                                    value: (
                                        <span>
                                            {hammer.format['Number'](tabletErrors.length)}
                                            <Button
                                                view="flat-secondary"
                                                size="m"
                                                onClick={handleErrorsClick}
                                            >
                                                View
                                            </Button>
                                        </span>
                                    ),
                                    visible: tabletErrors.length > 0,
                                },
                                {
                                    key: 'replication_errors',
                                    value: (
                                        <span>
                                            {hammer.format['Number'](
                                                keys_(replicationErrors).length,
                                            )}
                                            <Button
                                                view="flat-secondary"
                                                size="m"
                                                onClick={handleReplicationErrorsClick}
                                            >
                                                View
                                            </Button>
                                        </span>
                                    ),
                                    visible: keys_(replicationErrors).length > 0,
                                },
                                {
                                    key: 'state',
                                    value: (
                                        <Label
                                            theme={stateTheme}
                                            text={hammer.format['ReadableField'](state)}
                                        />
                                    ),
                                },
                                {
                                    key: 'index',
                                    value: hammer.format['Number'](index),
                                },
                                {
                                    key: 'pivot_key',
                                    value: (
                                        <Yson
                                            value={pivotKey}
                                            settings={{
                                                indent: 0,
                                                break: false,
                                            }}
                                        />
                                    ),
                                    visible: Boolean(pivotKey),
                                },
                                {
                                    key: 'next_pivot_key',
                                    value: (
                                        <Yson
                                            value={nextPivotKey}
                                            settings={{
                                                indent: 0,
                                                break: false,
                                            }}
                                        />
                                    ),
                                    visible: Boolean(nextPivotKey),
                                },
                            ],
                            [
                                {
                                    key: 'unmerged_row_count',
                                    value: hammer.format['Number'](unmergedRowCount),
                                    visible: !unorderedDynamicTable,
                                },
                                {
                                    key: 'chunks',
                                    value: hammer.format['Number'](chunkCount),
                                },
                                ...size(statistics, mediumList),
                            ],
                        ]}
                    />

                    <MetaTable items={[performanceMeta, resourcesMeta]} />
                </div>

                {!unorderedDynamicTable && (
                    <Histogram
                        handleHistogramChange={handleHistogramChange}
                        activeHistogram={activeHistogram}
                        histogramItems={histogramItems}
                        histogram={histogram}
                    />
                )}

                {renderErrorsDialog(errors, handleErrorsCloseClick)}
                {renderReplicationErrorsDialog(replicaErrors, handleReplicationErrorsCloseClick)}
            </div>
        </ErrorBoundary>
    );
}

export default Overview;
