import {type ConnectedProps, connect} from 'react-redux';
import hammer from '../../common/hammer';
import cn from 'bem-cn-lite';
import React from 'react';

import map_ from 'lodash/map';

import {
    selectGetECDF,
    selectGetIsDataGood,
    selectGetPDF,
    selectGetQuartiles,
} from '../../store/selectors/histogram';
import HistogramChart, {type HistogramChartProps} from './HistogramChart';
import {type RootState} from '../../store/reducers';

import './Histogram.scss';
import {Checkbox, Select} from '@gravity-ui/uikit';
import i18n from './i18n';

const block = cn('histogram');

export type HistogramProps = {
    activeHistogram: string;
    handleHistogramChange: (value: string) => void;
    histogramItems: Record<string, {title?: string}>;
    histogram: {
        data: number[];
        format: HistogramChartProps['format'];
        dataName: string;
        dataFormat?: string;
    };
};

function Histogram(props: HistogramProps & ConnectedProps<typeof connector>) {
    const {activeHistogram, handleHistogramChange, histogramItems} = props;
    const {histogram, quartiles, pdf, ecdf, isDataGood} = props;

    const params = {...histogram, pdf, ecdf};

    const [isDatailedLine, setDetailed] = React.useState(false);

    return (
        <div className={block()}>
            <div className={block('toolbar')}>
                <Select
                    value={[activeHistogram]}
                    onUpdate={(values) => handleHistogramChange(values[0])}
                    options={map_(histogramItems, ({title}, key) => {
                        return {value: key, content: title ?? key};
                    })}
                    width="max"
                />
                <Checkbox
                    className={block('detailed')}
                    checked={isDatailedLine}
                    onUpdate={setDetailed}
                >
                    {i18n('field_detailed-line')}
                </Checkbox>
            </div>

            {isDataGood ? (
                <HistogramChart className={block('chart')} {...params} lineOnly={isDatailedLine} />
            ) : (
                <div className={block('bad-data')}>
                    <p className={block('bad-data-message')}>{i18n('alert_bad-data')}</p>
                </div>
            )}

            <ul className={block('quartiles')}>
                <li className={block('quartiles-item')}>
                    {i18n('field_min')} –{' '}
                    <span className={block('quartiles-count')}>
                        {hammer.format[histogram.format](quartiles.min)}
                    </span>
                </li>
                <li className={block('quartiles-item')}>
                    {i18n('field_q25')} –{' '}
                    <span className={block('quartiles-count')}>
                        {hammer.format[histogram.format](quartiles.q25)}
                    </span>
                </li>
                <li className={block('quartiles-item')}>
                    {i18n('field_q50')} –{' '}
                    <span className={block('quartiles-count')}>
                        {hammer.format[histogram.format](quartiles.q50)}
                    </span>
                </li>
                <li className={block('quartiles-item')}>
                    {i18n('field_q75')} –{' '}
                    <span className={block('quartiles-count')}>
                        {hammer.format[histogram.format](quartiles.q75)}
                    </span>
                </li>
                <li className={block('quartiles-item')}>
                    {i18n('field_max')} –{' '}
                    <span className={block('quartiles-count')}>
                        {hammer.format[histogram.format](quartiles.max)}
                    </span>
                </li>
            </ul>
        </div>
    );
}

// https://github.com/reduxjs/reselect#sharing-selectors-with-props-across-multiple-component-instances
const makeMapStateToProps = () => {
    const getQuartiles = selectGetQuartiles();
    const getPDF = selectGetPDF();
    const getECDF = selectGetECDF();
    const getIsDataGood = selectGetIsDataGood();

    return (state: RootState, props: HistogramProps) => {
        const quartiles = getQuartiles(state, props);
        const pdf = getPDF(state, props);
        const ecdf = getECDF(state, props);
        const isDataGood = getIsDataGood(state, props);

        return {quartiles, pdf, ecdf, isDataGood};
    };
};

const connector = connect(makeMapStateToProps);
export default connector(Histogram);
