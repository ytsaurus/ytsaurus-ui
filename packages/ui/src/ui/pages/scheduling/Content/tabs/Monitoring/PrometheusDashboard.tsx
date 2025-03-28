import React from 'react';
import {YTApiId, ytApiV3Id} from '../../../../../rum/rum-wrap-api';
import {YTErrorBlock} from '../../../../../components/Block/Block';
import {YTError} from '../../../../../../@types/types';

export type PrometheusDashboardProps = {
    type: 'scheduler-pool';
    params: {cluster: string; pool: string; tree: string};
};

function PrometheusDashboardImpl({type, params}: PrometheusDashboardProps) {
    const {layout, error} = usePrometheusLayout(type);
    return (
        <div>
            {error && <YTErrorBlock error={error} />}
            <CheckLayoutParams templating={layout?.templating} params={params} />
            <div>{JSON.stringify(layout)}</div>
        </div>
    );
}

export const PrometheusDashboard = React.memo(PrometheusDashboardImpl);

function usePrometheusLayout(type: PrometheusDashboardProps['type']) {
    const [result, setData] = React.useState<{layout?: DashbordInfo; error?: YTError}>({});
    React.useEffect(() => {
        ytApiV3Id
            .get<DashbordInfo>(YTApiId.prometheusMonitoringLayout, {
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

type DashbordInfo = {
    templating: {list: Array<{name: string}>};
    panels: Array<DashboardPanel>;
};

type DashboardPanel = {
    gridPos: {x: number; y: number; w: number; h: number};
    type: 'row';
};

function CheckLayoutParams({
    templating,
    params,
}: Pick<Partial<DashbordInfo>, 'templating'> & Pick<PrometheusDashboardProps, 'params'>) {
    const details: YTError | undefined = React.useMemo(() => {
        const inner_errors = templating?.list.reduce((acc, {name: n}) => {
            const name = n as keyof typeof params;
            if (params[name] !== undefined) {
                acc.push({message: `Missing parameter "${name}".`});
            }
            return acc;
        }, [] as Array<YTError>);

        if (!inner_errors?.length) {
            return undefined;
        }
        return {message: 'You have to provide all required parameters', inner_errors};
    }, [templating, params]);

    return details ? <YTErrorBlock error={details} type="alert" bottomMargin /> : null;
}
