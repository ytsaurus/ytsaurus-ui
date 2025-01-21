import {ChartType} from '../constants';

export const getAxisNameByType = (type: ChartType) => {
    switch (type) {
        case ChartType.Pie:
            return {
                xLabel: 'Names:',
                yLabel: 'Values:',
            };
        case ChartType.BarY:
            return {
                xLabel: 'Y:',
                yLabel: 'X:',
            };
        default:
            return {
                xLabel: 'X:',
                yLabel: 'Y:',
            };
    }
};
