import _ from 'lodash';
import type {ChartKitWidgetData} from '@gravity-ui/chartkit';
import {prepareBar} from './bar';
import {prepareScatter} from './scatter';
import type {PrepareLineArgs} from './types';
import {buildD3Config} from './d3config';

export const prepareWidgetData = (args: PrepareLineArgs): ChartKitWidgetData => {
    const d3Config = buildD3Config(args);

    let data;

    switch (args.visualization.id) {
        case 'scatter': {
            data = prepareScatter(args);
            break;
        }
        default: {
            data = prepareBar(args);
        }
    }

    return _.merge(data, d3Config);
};
