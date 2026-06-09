import React from 'react';
import reduce_ from 'lodash/reduce';
import cloneDeep_ from 'lodash/cloneDeep';
import {type FieldConfig} from '../../../../../shared/prometheus/types';

export type PrometheusChartFieldConfig = {
    showLegend?: boolean;
    axisLabel?: string;
    propertiesByRefId: Record<string, FieldConfig['defaults']>;
};

export function usePrometheusChartFieldConfig(
    fieldConfig: FieldConfig,
): PrometheusChartFieldConfig {
    const res = React.useMemo(() => {
        const {defaults} = fieldConfig ?? {};
        return {
            showLegend: !defaults?.custom?.hideForm?.legend,
            axisLabel: defaults?.custom?.axisLabel,
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
                            const dst = propsAcc;
                            if (!dst.custom) {
                                dst.custom = {};
                            }
                            switch (propItem.id) {
                                case 'custom.stacking': {
                                    dst.custom.stacking =
                                        propItem.value ?? defaults?.custom?.stacking;
                                    break;
                                }
                                case 'unit': {
                                    dst.unit = propItem.value ?? defaults?.unit;
                                }
                            }
                            return propsAcc;
                        },
                        cloneDeep_(defaults ?? {}),
                    );

                    return acc;
                },
                {} as Record<string, typeof defaults>,
            ),
        };
    }, [fieldConfig]);

    return res;
}
