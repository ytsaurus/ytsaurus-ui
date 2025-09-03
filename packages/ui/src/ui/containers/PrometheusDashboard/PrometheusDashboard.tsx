import React from 'react';
import cn from 'bem-cn-lite';

import {YTApiId, ytApiV3Id} from '../../rum/rum-wrap-api';

import {YTError} from '../../../@types/types';

import {YTErrorBlock} from '../../components/Block/Block';
import type {PrometheusDashboardType} from '../../store/reducers/prometheusDashboard/prometheusDahsboard';
import {YTTimeline} from '../../components/Timeline';
import {Toolbar} from '../../components/WithStickyToolbar/Toolbar/Toolbar';
import {StickyContainer} from '../../components/StickyContainer/StickyContainer';
import {YTErrors} from '../../rum/constants';

import {
    PrometheusDashboardProvider,
    usePrometheusDashboardContext,
} from './PrometheusDashboardContext/PrometheusDashboardContext';
import {PrometheusDashKit} from './PrometheusDashKit';
import {DashboardInfo} from '../../../shared/prometheus/types';

import './PrometheusDashboard.scss';

const block = cn('yt-prometheus-dashboard');

export type PrometheusDashboardProps = {
    toolbarStickyTop?: number;
    type: PrometheusDashboardType;
    params?: Record<string, {toString(): string}>;
    timeRange?: {from: number; to?: number};
};

export const PrometheusDashboard = React.memo(function ({
    type,
    params,
    toolbarStickyTop,
}: PrometheusDashboardProps) {
    const {layout, error} = useLoadedLayout({type, params});
    return !params ? null : (
        <PrometheusDashboardProvider type={type}>
            <StickyContainer topOffset={toolbarStickyTop}>
                {({stickyTopClassName}) => (
                    <React.Fragment>
                        <PrometheusTimeline className={stickyTopClassName} />
                        {error && <YTErrorBlock error={error} />}
                        <MissingParametersWarning templating={layout?.templating} params={params} />
                        {layout?.panels === undefined ? null : (
                            <PrometheusDashKit panels={layout.panels} params={params} />
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
                path: `//sys/interface-monitoring/${type}`,
            })
            .then((layout) => {
                setData({layout});
            })
            .catch((error) => {
                if (error.code === YTErrors.NODE_DOES_NOT_EXIST) {
                    setData({layout: makeNotImplementedLayout({type, params})});
                } else {
                    setData({error});
                }
            });
    }, [type]);
    return result;
}

function makeNotImplementedLayout({type, params}: PrometheusDashboardProps) {
    return {
        templating: {list: []},
        panels: [
            {
                type: 'text' as const,
                options: {
                    content: [
                        `####   \`//sys/interface-monitoring/${type}\` is not exist`,
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
    };
}

function PrometheusTimeline({className}: {className?: string}) {
    const {
        timeRangeFilter: {from, to, shortcutValue},
        setTimeRangeFilter,
    } = usePrometheusDashboardContext();

    return (
        <Toolbar
            className={block('toolbar', className)}
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
                },
            ]}
        />
    );
}

function MissingParametersWarning({
    templating,
    params,
}: Pick<Partial<DashboardInfo>, 'templating'> &
    Pick<Required<PrometheusDashboardProps>, 'params'>) {
    const details: YTError | undefined = React.useMemo(() => {
        const inner_errors = templating?.list.reduce((acc, {name: n}) => {
            const name = n as keyof typeof params;
            if (params[name] === undefined) {
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
