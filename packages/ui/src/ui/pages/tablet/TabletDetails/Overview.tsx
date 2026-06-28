import React, {useCallback, useState} from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import hammer from '../../../common/hammer';
// @ts-ignore
import ypath from '@ytsaurus/interface-helpers/lib/ypath';

import keys_ from 'lodash/keys';
import map_ from 'lodash/map';

import {Button} from '@gravity-ui/uikit';
import {DialogWrapper as Dialog} from '../../../components/DialogWrapper/DialogWrapper';

import ErrorBoundary from '../../../containers/ErrorBoundary/ErrorBoundary';
import {MetaTable, Tooltip} from '@ytsaurus/components';
import {Template} from '../../../components/MetaTable/templates/Template';
import Histogram from '../../../components/Histogram/Histogram';
import {size} from '../../../components/MetaTable/presets';
import {YTErrorBlock} from '../../../containers/Block/Block';
import Label, {type LabelTheme} from '../../../components/Label';
import {Yson} from '../../../components/Yson/Yson';

import {histogramItems} from '../../../utils/tablet/tablet';
import {getActiveHistogram, selectHistogram} from '../../../store/selectors/tablet/tablet';
import {changeActiveHistogram} from '../../../store/actions/tablet/tablet';
import {Tab as NavigationTab} from '../../../constants/navigation';
import {Page} from '../../../constants/index';
import {genTabletCellBundlesCellUrl} from '../../../utils/tablet_cell_bundles';
import StoresDialog from './StoresDialog';
import {makeComponentsNodesUrl} from '../../../utils/app-url';
import {type YTErrorRaw} from '../../../../@types/types';
import i18n from './i18n';
import {getMediumList} from '../../../store/selectors/thor';

type ReplicationErrors = Record<string, YTErrorRaw>;

type TabletMetaKey =
    | 'overlapping_store_count'
    | 'preload_completed_store_count'
    | 'preload_failed_store_count'
    | 'preload_pending_store_count'
    | 'partition_count'
    | 'dynamic_row_read_rate'
    | 'dynamic_row_lookup_rate'
    | 'dynamic_row_write_rate'
    | 'dynamic_row_delete_rate'
    | 'static_chunk_row_read_rate'
    | 'static_chunk_row_lookup_rate'
    | 'unmerged_row_read_rate'
    | 'merged_row_read_rate';

function makeMetaItem(
    format: 'Number',
    data: Record<string, unknown>,
    key: TabletMetaKey,
    visible?: boolean,
) {
    return {
        key,
        label: i18n(`meta_${key}`),
        value: hammer.format[format](data[key]),
        visible,
    };
}

const renderErrorsDialog = (errors: YTErrorRaw[], handleClose: () => void) => {
    const visible = errors.length > 0;

    return (
        <Dialog size="l" open={visible} onClose={handleClose} hasCloseButton>
            <Dialog.Header caption={i18n('title_tablet-errors')} />
            <Dialog.Body>
                {map_(errors, (err, index) => {
                    const error = {
                        ...err,
                        message: ypath.getValue(err, '/message'),
                    };
                    return <YTErrorBlock error={error} key={index} />;
                })}
            </Dialog.Body>
        </Dialog>
    );
};

const renderReplicationErrorsDialog = (
    replicationErrors: ReplicationErrors,
    handleClose: () => void,
) => {
    const visible = keys_(replicationErrors).length > 0;

    return (
        <Dialog size="l" open={visible} onClose={handleClose} hasCloseButton>
            <Dialog.Header caption={i18n('title_replication-errors')} />
            <Dialog.Body>
                {map_(replicationErrors, (err, replica) => {
                    const error = {
                        ...err,
                        message: ypath.getValue(err, '/message'),
                    };
                    const message = i18n('context_replica-id', {replica});
                    return <YTErrorBlock message={message} error={error} key={replica} />;
                })}
            </Dialog.Body>
        </Dialog>
    );
};

interface Props {
    id: string;
    block: (...args: Array<string | undefined>) => string;
}

function Overview({id, block}: Props) {
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
        stores = {},
        unorderedDynamicTable,
    } = useSelector((state) => state.tablet.tablet);

    const mediumList = useSelector(getMediumList);
    const cluster = useSelector((state) => state.global.cluster);
    const [errors, setErrorsVisibility] = useState<YTErrorRaw[]>([]);
    const [replicaErrors, setReplicationErrorsVisibility] = useState<ReplicationErrors>({});

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
                  label: i18n('meta_store-count'),
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
                                          content={i18n('context_too-many-stores')}
                                      >
                                          <Button
                                              disabled={disableStoresDialog}
                                              view="flat-secondary"
                                              onClick={toggleStoresVisibility}
                                          >
                                              {i18n('action_view')}
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

    const stateThemeMap: Record<string, LabelTheme> = {
        none: 'default',
        unmounted: 'default',
        mounted: 'info',
        frozen: 'info',
        freezing: 'warning',
        unfreezing: 'warning',
        mounting: 'warning',
        unmounting: 'warning',
        mixed: 'danger',
    };
    const stateTheme: LabelTheme | undefined = stateThemeMap[state as string];

    const activeHistogram = useSelector(getActiveHistogram);
    const histogram = useSelector(selectHistogram);

    const handleHistogramChange = useCallback(
        (histogram: string) => dispatch(changeActiveHistogram(histogram)),
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
                                    label: i18n('meta_id'),
                                    value: <Template.Id id={id} />,
                                },
                                {
                                    key: 'tablet_cell_id',
                                    label: i18n('meta_tablet-cell-id'),
                                    value: (
                                        <Template.Link
                                            withClipboard
                                            text={cellId}
                                            shiftText={tabletPath}
                                            hoverContent={i18n('context_hold-shift-key')}
                                            url={genTabletCellBundlesCellUrl(cellId, cluster)}
                                        />
                                    ),
                                },
                                {
                                    key: 'table_path',
                                    label: i18n('field_table-path'),
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
                                    label: i18n('meta_tablet-cell-leader-node'),
                                    value: (
                                        <Template.Link
                                            withClipboard
                                            text={cellLeadingPeer?.address}
                                            url={makeComponentsNodesUrl({
                                                cluster,
                                                host: cellLeadingPeer?.address,
                                            })}
                                        />
                                    ),
                                    visible: Boolean(cellLeadingPeer),
                                },
                                {
                                    key: 'errors',
                                    label: i18n('meta_errors'),
                                    value: (
                                        <span>
                                            {hammer.format['Number'](tabletErrors.length)}
                                            <Button
                                                view="flat-secondary"
                                                size="m"
                                                onClick={handleErrorsClick}
                                            >
                                                {i18n('action_view')}
                                            </Button>
                                        </span>
                                    ),
                                    visible: tabletErrors.length > 0,
                                },
                                {
                                    key: 'replication_errors',
                                    label: i18n('meta_replication-errors'),
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
                                                {i18n('action_view')}
                                            </Button>
                                        </span>
                                    ),
                                    visible: keys_(replicationErrors).length > 0,
                                },
                                {
                                    key: 'state',
                                    label: i18n('meta_state'),
                                    value: (
                                        <Label
                                            theme={stateTheme}
                                            text={hammer.format['ReadableField'](state)}
                                        />
                                    ),
                                },
                                {
                                    key: 'index',
                                    label: i18n('meta_index'),
                                    value: hammer.format['Number'](index),
                                },
                                {
                                    key: 'pivot_key',
                                    label: i18n('meta_pivot-key'),
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
                                    label: i18n('meta_next-pivot-key'),
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
                                    label: i18n('meta_unmerged-row-count'),
                                    value: hammer.format['Number'](unmergedRowCount),
                                    visible: !unorderedDynamicTable,
                                },
                                {
                                    key: 'chunks',
                                    label: i18n('meta_chunks'),
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
