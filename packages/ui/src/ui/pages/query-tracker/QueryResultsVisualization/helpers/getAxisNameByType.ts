import {ChartType} from '../constants';
import i18n from '../components/Wizard/i18n';

export const getAxisNameByType = (type: ChartType) => {
    switch (type) {
        case ChartType.Pie:
            return {
                xLabel: i18n('field_names'),
                yLabel: i18n('field_values'),
            };
        case ChartType.BarY:
            return {
                xLabel: i18n('field_y'),
                yLabel: i18n('field_x'),
            };
        default:
            return {
                xLabel: i18n('field_x'),
                yLabel: i18n('field_y'),
            };
    }
};
