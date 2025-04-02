import React from 'react';
import {YTApiId, ytApiV3Id} from '../../rum/rum-wrap-api';
import {YTErrorBlock} from '../../components/Block/Block';
import {YTError} from '../../../@types/types';
import {PrometheusDashKit} from './PrometheusDashKit';

export type PrometheusDashboardProps = {
    type: 'scheduler-pool';
    params?: Record<string, {toString(): string}>;
};

function PrometheusDashboardImpl({type, params}: PrometheusDashboardProps) {
    const {layout, error} = usePrometheusLayout(type);
    return !params ? null : (
        <div>
            {error && <YTErrorBlock error={error} />}
            <MissingParametersWarning templating={layout?.templating} params={params} />
            {layout?.panels === undefined ? null : (
                <PrometheusDashKit panels={layout.panels} params={params} />
            )}
        </div>
    );
}

export const PrometheusDashboard = React.memo(PrometheusDashboardImpl);

function usePrometheusLayout(type: PrometheusDashboardProps['type']) {
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
                setData({error});
            });
    }, [type]);
    return result;
}

export type DashboardInfo = {
    templating: {list: Array<{name: string}>};
    panels: Array<DashboardPanel>;
};

export type DashboardPanel = {
    title?: string;
    gridPos: {x: number; y: number; w: number; h: number};
} & DashaboardPanelByType;

export type DashaboardPanelByType =
    | {type: 'row'}
    | {type: 'text'; options: {mode: 'markdown'; content: string}}
    | {type: 'timeseries'; targets: Array<TimeseriesTarget>; title: string};

export type TimeseriesTarget = {expr: string; legendFormat: string; refId: string};

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
