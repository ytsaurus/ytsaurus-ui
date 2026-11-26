import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {ArrowRotateRight} from '@gravity-ui/icons';
import {
    Alert,
    Button,
    Flex,
    Icon,
    Label,
    Link,
    Select,
    Table,
    type TableColumnConfig,
    Text,
    TextInput,
    Tooltip,
} from '@gravity-ui/uikit';

import format from '../../../common/hammer/format';
import SimplePagination from '../../../components/Pagination/SimplePagination';
import PathView from '../../../containers/PathFragment/PathFragment';
import {showErrorModal} from '../../../store/actions/modals/errors';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {selectCluster} from '../../../store/selectors/global';
import {selectIsAdmin} from '../../../store/selectors/global/is-developer';
import {
    type ChytMaterializedView,
    type ChytMaterializedViewsResponse,
    chytApiAction,
} from '../../../utils/strawberryControllerApi';
import {makeNavigationLink} from '../../../utils/app-url';
import {Updater} from '../../../utils/hammer/updater';

import i18n from './i18n';

const PAGE_SIZE = 20;
const TOOLTIP_OPEN_DELAY = 300;
const REFRESH_INTERVALS = [0, 5, 15, 30, 60, 300];

function summarize(view: ChytMaterializedView) {
    const partitions = view.progress?.partitions ?? [];
    const lag = view.progress
        ? partitions.reduce(
              (total, part) => total + Math.max(0, part.total_row_count - part.next_row_index),
              0,
          )
        : undefined;
    const errors = partitions.flatMap(({partition_index, last_error}, index) =>
        last_error ? [`#${partition_index ?? index}: ${last_error}`] : [],
    );
    if (view.progress?.last_error) {
        errors.unshift(view.progress.last_error);
    }
    const lastUpdate = partitions.reduce(
        (latest, {last_update}) => (last_update && last_update > latest ? last_update : latest),
        '',
    );
    return {...view, lag, errors, lastUpdate};
}

type ViewRow = ReturnType<typeof summarize>;

const statusThemes = {
    failed: 'danger',
    unknown: 'normal',
    delayed: 'warning',
    ready: 'success',
} as const;

function ViewStatus({lag, errors}: ViewRow) {
    let status: keyof typeof statusThemes = 'ready';
    if (errors.length) {
        status = 'failed';
    } else if (lag === undefined) {
        status = 'unknown';
    } else if (lag > 0) {
        status = 'delayed';
    }

    return (
        <Tooltip openDelay={TOOLTIP_OPEN_DELAY} content={i18n(`mv_status_${status}_hint`)}>
            <span tabIndex={0}>
                <Label theme={statusThemes[status]}>{i18n(`mv_status_${status}`)}</Label>
            </span>
        </Tooltip>
    );
}

export function ChytPageCliqueMaterializedViews({alias}: {alias: string}) {
    const cluster = useSelector(selectCluster);
    return (
        <MaterializedViews key={JSON.stringify([cluster, alias])} cluster={cluster} alias={alias} />
    );
}

function MaterializedViews({cluster, alias}: {cluster: string; alias: string}) {
    const dispatch = useDispatch();
    const isAdmin = useSelector(selectIsAdmin);
    const [search, setSearch] = useState('');
    const [response, setResponse] = useState<ChytMaterializedViewsResponse>();
    const [request, setRequest] = useState(0);
    const [refreshInterval, setRefreshInterval] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const cancel = axios.CancelToken.source();
        const load = async () => {
            setLoading(true);
            try {
                const {result} = await chytApiAction(
                    'list_materialized_views',
                    cluster,
                    {alias},
                    {
                        isAdmin,
                        cancelToken: cancel.token,
                        skipErrorToast: true,
                    },
                );
                if (!cancel.token.reason) {
                    setResponse(result);
                    setError(false);
                }
            } catch {
                if (!cancel.token.reason) {
                    setError(true);
                }
            } finally {
                if (!cancel.token.reason) {
                    setLoading(false);
                }
            }
        };
        const updater = refreshInterval ? new Updater(load, refreshInterval * 1000) : undefined;
        if (!updater) {
            load();
        }
        return () => {
            updater?.destroy();
            cancel.cancel();
        };
    }, [cluster, alias, isAdmin, request, refreshInterval]);

    const term = search.trim().toLowerCase();
    const matchingViews = (response?.views ?? [])
        .filter(({name, source_path, target_path}) =>
            [name, source_path, target_path].some((value) => value.toLowerCase().includes(term)),
        )
        .sort((left, right) => left.name.localeCompare(right.name));
    const lastPage = Math.max(1, Math.ceil(matchingViews.length / PAGE_SIZE));
    const currentPage = Math.min(page, lastPage);
    const offset = (currentPage - 1) * PAGE_SIZE;
    const rows = matchingViews.slice(offset, offset + PAGE_SIZE).map(summarize);

    useEffect(() => {
        setPage((value) => Math.min(value, lastPage));
    }, [lastPage]);

    const tableLink = (path: string) => (
        <Tooltip
            openDelay={TOOLTIP_OPEN_DELAY}
            content={<div className="chyt-page-clique__mv-tooltip-text">{path}</div>}
        >
            <Link
                className="chyt-page-clique__mv-path"
                href={makeNavigationLink({cluster, path})}
                target="_blank"
                rel="noopener noreferrer"
            >
                <PathView path={path} lastFragmentOnly />
            </Link>
        </Tooltip>
    );
    const columns: TableColumnConfig<ViewRow>[] = [
        {id: 'name', name: i18n('mv_view'), align: 'center'},
        {
            id: 'source',
            name: i18n('mv_source'),
            align: 'center',
            template: ({source_path}) => tableLink(source_path),
        },
        {
            id: 'target',
            name: i18n('mv_target'),
            align: 'center',
            template: ({target_path}) => tableLink(target_path),
        },
        {
            id: 'status',
            name: i18n('mv_status'),
            align: 'center',
            template: (row) => <ViewStatus {...row} />,
        },
        {
            id: 'lag',
            name: i18n('mv_lag'),
            align: 'center',
            template: ({lag}) => lag ?? '—',
        },
        {
            id: 'lastUpdate',
            name: i18n('mv_last_update'),
            align: 'center',
            template: ({lastUpdate}) => (lastUpdate ? format.DateTime(lastUpdate) : '—'),
        },
        {
            id: 'errors',
            name: i18n('mv_error'),
            align: 'center',
            template: ({name, errors}) =>
                errors.length ? (
                    <button
                        type="button"
                        className="chyt-page-clique__mv-error-action"
                        onClick={() =>
                            dispatch(
                                showErrorModal(
                                    {
                                        message: i18n('mv_refresh_error', {view: name}),
                                        inner_errors: errors.map((message) => ({message})),
                                    },
                                    {hideOopsMsg: true, disableLogger: true},
                                ),
                            )
                        }
                    >
                        {i18n('mv_error_details')}
                    </button>
                ) : (
                    '—'
                ),
        },
    ];
    return (
        <Flex direction="column" gap="3">
            <Flex alignItems="center" gap="3">
                <TextInput
                    aria-label={i18n('mv_search')}
                    placeholder={i18n('mv_search')}
                    value={search}
                    onUpdate={(value) => {
                        setSearch(value);
                        setPage(1);
                    }}
                    hasClear
                    disabled={!response?.enabled}
                />
                <Flex>
                    <Button
                        aria-label={i18n('mv_refresh')}
                        title={i18n('mv_refresh')}
                        pin="round-brick"
                        view="outlined"
                        loading={loading}
                        disabled={loading}
                        onClick={() => setRequest((value) => value + 1)}
                    >
                        <Icon data={ArrowRotateRight} size={16} />
                    </Button>
                    <Select
                        aria-label={i18n('mv_auto_refresh')}
                        pin="brick-round"
                        label={i18n('mv_auto_refresh')}
                        width={172}
                        value={[String(refreshInterval)]}
                        onUpdate={([value]) => setRefreshInterval(Number(value))}
                        options={REFRESH_INTERVALS.map((seconds) => {
                            let content = i18n('mv_refresh_off');
                            if (seconds >= 60) {
                                content = i18n('mv_refresh_minutes', {count: seconds / 60});
                            } else if (seconds > 0) {
                                content = i18n('mv_refresh_seconds', {count: seconds});
                            }
                            return {value: String(seconds), content};
                        })}
                    />
                </Flex>
                {lastPage > 1 && (
                    <Flex alignItems="center" gap={2} shrink={0}>
                        <Text color="secondary">
                            {i18n('mv_page_range', {
                                from: offset + 1,
                                to: offset + rows.length,
                                total: matchingViews.length,
                            })}
                        </Text>
                        <SimplePagination
                            value={currentPage}
                            min={1}
                            max={lastPage}
                            onChange={setPage}
                        />
                    </Flex>
                )}
            </Flex>
            {error && <Alert theme="danger" title={i18n('mv_load_error')} />}
            {response?.enabled === false && <Alert theme="info" title={i18n('mv_disabled')} />}
            {response?.enabled && !response.operation_running && (
                <Alert theme="warning" title={i18n('mv_saved_progress')} />
            )}
            {response?.enabled &&
                (rows.length ? (
                    <Table data={rows} columns={columns} width="max" wordWrap />
                ) : (
                    i18n('mv_empty')
                ))}
        </Flex>
    );
}
