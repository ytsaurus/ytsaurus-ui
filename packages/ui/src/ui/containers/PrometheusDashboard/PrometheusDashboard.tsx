import React from 'react';
import {YTApiId, ytApiV3Id} from '../../rum/rum-wrap-api';

import {YTError} from '../../../@types/types';

import {YTErrorBlock} from '../../components/Block/Block';
import type {PrometheusDashboardType} from '../../store/reducers/prometheusDashboard/prometheusDahsboard';
import {YTTimeline} from '../../components/common/YTTimeline';
import WithStickyToolbar from '../../components/WithStickyToolbar/WithStickyToolbar';

import {
    PrometheusDashboardProvider,
    usePrometheusDashboardContext,
} from './PrometheusDashboardContext/PrometheusDashboardContext';
import {PrometheusDashKit} from './PrometheusDashKit';
import {DashboardInfo} from './types';

export type PrometheusDashboardProps = {
    type: PrometheusDashboardType;
    params?: Record<string, {toString(): string}>;
};

export const PrometheusDashboard = React.memo(function ({type, params}: PrometheusDashboardProps) {
    const {layout, error} = useLoadedLayout(type);
    return !params ? null : (
        <PrometheusDashboardProvider type={type}>
            <WithStickyToolbar
                toolbar={<PrometheusTimeline />}
                content={
                    <React.Fragment>
                        {error && <YTErrorBlock error={error} />}
                        <MissingParametersWarning templating={layout?.templating} params={params} />
                        {layout?.panels === undefined ? null : (
                            <PrometheusDashKit panels={layout.panels} params={params} />
                        )}
                    </React.Fragment>
                }
            />
        </PrometheusDashboardProvider>
    );
});
PrometheusDashboard.displayName = 'PrometheusDashboard';

function useLoadedLayout(type: PrometheusDashboardType) {
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

function PrometheusTimeline() {
    const {
        timeRangeFilter: {from, to, shortcutValue},
        setTimeRangeFilter,
    } = usePrometheusDashboardContext();

    return (
        <YTTimeline
            from={from!}
            to={to!}
            shortcut={shortcutValue}
            onUpdate={setTimeRangeFilter}
            hasRuler={true}
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
