import React from 'react';
import cn from 'bem-cn-lite';
import {useSelector} from 'react-redux';
import uniq_ from 'lodash/uniq';

import {Select, Link} from '@gravity-ui/uikit';

import {
    CheckPermissionResult,
    makeCheckPermissionBatchSubRequest,
} from '../../../shared/utils/check-permission';
import {
    DashboardInfo,
    PluginRendererDataParams,
    PrometheusDashboardType,
} from '../../../shared/prometheus/types';
import {getDashboardPath, makeDiscoverValuesKey} from '../../../shared/prometheus/utils';
import {YTError} from '../../../@types/types';

import {getConfigData} from '../../config/ui-settings';
import {YTErrorBlock} from '../../components/Block/Block';
import {StickyContainer} from '../../components/StickyContainer/StickyContainer';
import {YTTimeline} from '../../components/Timeline';
import {Toolbar, ToolbarItemToWrap} from '../../components/WithStickyToolbar/Toolbar/Toolbar';
import {YTErrors} from '../../rum/constants';
import {YTApiId, ytApiV3Id} from '../../rum/rum-wrap-api';
import {usePrometheusDiscoverValuesQuery} from '../../store/api/prometheus';
import {useFetchBatchQuery} from '../../store/api/yt/executeBatch';
import {usePrometheusDashboardParams} from '../../store/reducers/prometheusDashboard/prometheusDashboard-hooks';
import {getCluster} from '../../store/selectors/global/cluster';
import {getCurrentUserName} from '../../store/selectors/global';

import {PrometheusDashKit} from './PrometheusDashKit';
import {
    PrometheusDashboardProvider,
    usePrometheusDashboardContext,
} from './PrometheusDashboardContext/PrometheusDashboardContext';

import './PrometheusDashboard.scss';

const block = cn('yt-prometheus-dashboard');

export type PrometheusDashboardProps = {
    toolbarStickyTop?: number;
    type: PrometheusDashboardType;
    params?: PluginRendererDataParams;
    timeRange?: {from: number; to?: number};
    toolbarItems?: Array<ToolbarItemToWrap>;
};

export const PrometheusDashboard = React.memo(function (props: PrometheusDashboardProps) {
    const {type, params, toolbarStickyTop} = props;
    const {layout, error} = useLoadedLayout({type, params});

    const {toolbarItems, effectiveParams} = useDashboardToolbar({
        type,
        layout,
        params,
        toolbarItems: props.toolbarItems,
    });

    const hasToolbar = Boolean(toolbarItems?.length);

    return !effectiveParams ? null : (
        <PrometheusDashboardProvider type={type}>
            <StickyContainer
                className={block({'has-toolbar': hasToolbar})}
                topOffset={toolbarStickyTop}
            >
                {({stickyTopClassName}) => (
                    <React.Fragment>
                        <div className={block('toolbar', stickyTopClassName)}>
                            <PrometheusTimelineToolbar
                                uid={layout?.uid}
                                effectiveParams={effectiveParams}
                            />
                            {hasToolbar && (
                                <Toolbar itemsToWrap={toolbarItems ?? []} marginTopSkip />
                            )}
                        </div>
                        {error && <YTErrorBlock error={error} />}
                        <MissingParametersWarning
                            templating={layout?.templating}
                            params={effectiveParams}
                        />
                        {layout?.panels === undefined ? null : (
                            <PrometheusDashKit
                                key={type}
                                type={type}
                                panels={layout.panels}
                                params={effectiveParams}
                            />
                        )}
                    </React.Fragment>
                )}
            </StickyContainer>
        </PrometheusDashboardProvider>
    );
});
PrometheusDashboard.displayName = 'PrometheusDashboard';

function useLoadedLayout({type, params}: PrometheusDashboardProps) {
    const [result, setData] = React.useState<{layout?: DashboardInfo; error?: YTError}>({});
    /**
     * Temporary solution withot redux-store
     * TODO: use rtk-query later
     */
    React.useEffect(() => {
        ytApiV3Id
            .get<DashboardInfo>(YTApiId.prometheusMonitoringLayout, {
                path: getDashboardPath(type),
            })
            .then((layout) => {
                setData({layout});
            })
            .catch((error) => {
                if (error.code === YTErrors.NODE_DOES_NOT_EXIST) {
                    setData({layout: makeNotImplementedLayout({type, params, uid: ''})});
                } else {
                    setData({error});
                }
            });
    }, [type]);
    return result;
}

function makeNotImplementedLayout({type, params, uid}: PrometheusDashboardProps & {uid: string}) {
    return {
        templating: {list: []},
        panels: [
            {
                type: 'text' as const,
                options: {
                    content: [
                        `####   \`${getDashboardPath(type)}\` is not exist`,
                        '  You have to provide correct dashboard description, see expected parameters below:',
                        '```json',
                        JSON.stringify(params, null, 4),
                        '```',
                    ].join('\n'),
                    mode: 'markdown' as const,
                },
                gridPos: {x: 0, y: 0, w: 24, h: 27},
            },
        ],
        uid,
    };
}

function PrometheusTimelineToolbar({
    uid,
    effectiveParams,
}: {
    uid?: string;
    effectiveParams: Record<string, string | number>;
}) {
    const {
        timeRangeFilter: {from, to, shortcutValue},
        setTimeRangeFilter,
    } = usePrometheusDashboardContext();

    const grafanaUrl = useGrafanaUrl({uid, effectiveParams, from, to});

    return (
        <Toolbar
            itemsToWrap={[
                {
                    node: (
                        <YTTimeline
                            className={block('timeline')}
                            from={from!}
                            to={to!}
                            shortcut={shortcutValue}
                            onUpdate={setTimeRangeFilter}
                            hasRuler={true}
                        />
                    ),
                    growable: true,
                    marginRight: 'none',
                },
                {
                    node: grafanaUrl ? (
                        <Link href={grafanaUrl} target="_blank">
                            Grafana
                        </Link>
                    ) : null,
                },
            ]}
        />
    );
}

const {grafanaBaseUrl} = getConfigData().uiSettings ?? {};

function useGrafanaUrl({
    uid,
    effectiveParams,
    from,
    to,
}: {
    uid?: string;
    effectiveParams: Record<string, string | number>;
    from?: number;
    to?: number;
}) {
    const allowGrafanaUrl = useGrafanaUrlVisibility();
    const grafanaUrl = React.useMemo(() => {
        if (!uid || !grafanaBaseUrl || !allowGrafanaUrl || from === undefined || to === undefined) {
            return undefined;
        }

        const params = Object.keys(effectiveParams).reduce((acc, key) => {
            const value = effectiveParams[key];
            acc.append(`var-${key}`, String(value));
            return acc;
        }, new URLSearchParams());

        params.append('from', String(from));
        params.append('to', String(to));

        return `${grafanaBaseUrl}/d/${uid}?${params}`;
    }, [uid, effectiveParams, allowGrafanaUrl, from, to]);

    return grafanaUrl;
}

function useGrafanaUrlVisibility() {
    const cluster = useSelector(getCluster);
    const user = useSelector(getCurrentUserName);

    const {data, error} = useFetchBatchQuery<CheckPermissionResult>({
        cluster,
        id: YTApiId.checkPermissions,
        parameters: {
            requests: [
                makeCheckPermissionBatchSubRequest({
                    path: '//sys/interface-monitoring/allow_grafana_url',
                    user,
                    permission: 'use',
                }),
            ],
        },
        errorTitle: 'Check `use` permission for //sys/interface-monitoring/allow_grafana_url',
    });

    const {output} = data?.[0] ?? {};

    return (
        error?.inner_errors?.[0].code === YTErrors.NODE_DOES_NOT_EXIST || output?.action === 'allow'
    );
}

function MissingParametersWarning({
    templating,
    params,
}: Pick<Partial<DashboardInfo>, 'templating'> &
    Pick<Required<PrometheusDashboardProps>, 'params'>) {
    const details: YTError | undefined = React.useMemo(() => {
        const inner_errors = templating?.list.reduce((acc, {name: n, default_for_ui}) => {
            const name = n as keyof typeof params;
            if (params[name] === undefined && default_for_ui === undefined) {
                acc.push({message: `Missing parameter "${name}".`});
            }
            return acc;
        }, [] as Array<YTError>);

        if (!inner_errors?.length) {
            return undefined;
        }
        return {
            message: 'You have to provide all required parameters',
            attributes: {params} as any,
            inner_errors,
        };
    }, [templating, params]);

    return details ? <YTErrorBlock error={details} type="alert" bottomMargin /> : null;
}

function useDashboardToolbar({
    toolbarItems,
    layout,
    params,
    type,
}: {
    type: PrometheusDashboardType;
    params?: PluginRendererDataParams;
    layout?: DashboardInfo;
    toolbarItems?: Array<ToolbarItemToWrap>;
}) {
    const cluster = useSelector(getCluster);

    const {templating} = layout ?? {};
    const {list} = templating ?? {};

    const withDiscoverValues = React.useMemo(() => {
        if (!layout) {
            return [];
        }

        return list?.filter((item) => item.discover_values);
    }, [list, layout]);

    const {params: extraParams, setParams: setExtraParams} =
        usePrometheusDashboardParams<Record<string, string>>(type);

    const {data} = usePrometheusDiscoverValuesQuery({
        cluster,
        dashboardType: type,
        params,
        hasValuesToDiscover: Boolean(withDiscoverValues?.length),
    });

    const items = React.useMemo(() => {
        const res = [...(toolbarItems ?? [])];

        withDiscoverValues?.forEach(({label, name, default_for_ui, discover_values}) => {
            if (!discover_values || !data) {
                return;
            }
            const key = makeDiscoverValuesKey(discover_values);
            const dataItem = data[key];

            const value = extraParams?.[name] ?? default_for_ui;

            const availableOptions = uniq_([
                ...(default_for_ui ? [default_for_ui] : []),
                ...(dataItem.result?.data ?? []),
            ]);

            res.push({
                node: (
                    <Select
                        label={label}
                        value={value ? [value] : []}
                        options={availableOptions.map((v) => {
                            return {content: v, value: v};
                        })}
                        onUpdate={([v]) => {
                            setExtraParams({[name]: v});
                        }}
                    />
                ),
            });
        });

        return res;
    }, [withDiscoverValues, data, extraParams, setExtraParams, toolbarItems]);

    const effectiveParams = React.useMemo(() => {
        return !params ? undefined : {...params, ...extraParams};
    }, [params, extraParams]);

    return {toolbarItems: items, effectiveParams: effectiveParams};
}
