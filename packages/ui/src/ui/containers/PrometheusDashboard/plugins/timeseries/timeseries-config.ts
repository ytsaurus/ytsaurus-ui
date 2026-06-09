import React from 'react';
import reduce_ from 'lodash/reduce';
import {type FieldConfig} from '../../../../../shared/prometheus/types';

export type PrometheusChartFieldConfig = {
    showLegend?: boolean;
    axisLabel?: string;
    propertiesByRefId: Record<string, PrometheusChartProperties>;
};

export type PrometheusChartProperties = {
    unit?: 'bytes' | unknown;
};

export function usePrometheusChartFieldConfig(
    fieldConfig: FieldConfig,
): PrometheusChartFieldConfig {
    const res = React.useMemo(() => {
        return {
            showLegend: !fieldConfig?.defaults?.custom?.hideForm?.legend,
            axisLabel: fieldConfig?.defaults?.custom?.axisLabel,
            propertiesByRefId: reduce_(
                fieldConfig?.overrides,
                (acc, item) => {
                    const {matcher, properties} = item;
                    if (matcher.id !== 'byFrameRefID') {
                        return acc;
                    }
                    const refId = matcher.options;
                    // eslint-disable-next-line no-param-reassign
                    acc[refId] = reduce_(
                        properties,
                        (propsAcc, propItem) => {
                            propsAcc[propItem.id] = propItem.value;
                            return propsAcc;
                        },
                        {} as PrometheusChartProperties,
                    );

                    return acc;
                },
                {} as Record<string, PrometheusChartProperties>,
            ),
        };
    }, [fieldConfig]);

    return res;
}
