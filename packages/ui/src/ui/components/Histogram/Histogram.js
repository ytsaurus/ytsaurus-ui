import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import hammer from '../../common/hammer';
import cn from 'bem-cn-lite';
import React from 'react';

import keys_ from 'lodash/keys';
import map_ from 'lodash/map';

import {
    createGetECDF,
    createGetIsDataGood,
    createGetPDF,
    createGetQuartiles,
} from '../../store/selectors/histogram';
import HistogramChart from './HistogramChart';

import './Histogram.scss';
import {Checkbox, Select} from '@gravity-ui/uikit';

const block = cn('histogram');

Histogram.quartilesProps = PropTypes.shape({
    min: PropTypes.number,
    q25: PropTypes.number,
    q50: PropTypes.number,
    q75: PropTypes.number,
    max: PropTypes.number,
});

Histogram.pdfProps = PropTypes.shape({
    bucketNumber: PropTypes.number,
    bucketSize: PropTypes.number,
    max: PropTypes.number,
    min: PropTypes.number,
    valueMax: PropTypes.number,
    valueMin: PropTypes.number,
    quartiles: Histogram.quartilesProps,
    buckets: PropTypes.array,
});

Histogram.ecdfProps = PropTypes.shape({
    min: PropTypes.number,
    max: PropTypes.number,
    steps: PropTypes.array,
});

Histogram.propTypes = {
    // from parent
    activeHistogram: PropTypes.string.isRequired,
    handleHistogramChange: PropTypes.func.isRequired,
    histogramItems: PropTypes.object.isRequired,

    histogram: PropTypes.shape({
        data: PropTypes.array.isRequired,
        format: PropTypes.string.isRequired,
        dataName: PropTypes.string.isRequired,
        dataFormat: PropTypes.string.isRequired,
    }).isRequired,

    // from connect
    quartiles: Histogram.quartilesProps.isRequired,
    pdf: Histogram.pdfProps.isRequired,
    ecdf: Histogram.ecdfProps.isRequired,
    isDataGood: PropTypes.bool.isRequired,
};

function Histogram(props) {
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
                    options={map_(keys_(histogramItems), (value) => {
                        return {value, content: value};
                    })}
                    width="max"
                />
                <Checkbox
                    className={block('detailed')}
                    checked={isDatailedLine}
                    onUpdate={setDetailed}
                >
                    Detailed line
                </Checkbox>
            </div>

            {isDataGood ? (
                <HistogramChart className={block('chart')} {...params} lineOnly={isDatailedLine} />
            ) : (
                <div className={block('bad-data')}>
                    <p className={block('bad-data-message')}>
                        Could not draw a descriptive chart with given data.
                    </p>
                </div>
            )}

            <ul className={block('quartiles')}>
                <li className={block('quartiles-item')}>
                    Min –{' '}
                    <span className={block('quartiles-count')}>
                        {hammer.format[histogram.format](quartiles.min)}
                    </span>
                </li>
                <li className={block('quartiles-item')}>
                    Q25% –{' '}
                    <span className={block('quartiles-count')}>
                        {hammer.format[histogram.format](quartiles.q25)}
                    </span>
                </li>
                <li className={block('quartiles-item')}>
                    Q50% –{' '}
                    <span className={block('quartiles-count')}>
                        {hammer.format[histogram.format](quartiles.q50)}
                    </span>
                </li>
                <li className={block('quartiles-item')}>
                    Q75% –{' '}
                    <span className={block('quartiles-count')}>
                        {hammer.format[histogram.format](quartiles.q75)}
                    </span>
                </li>
                <li className={block('quartiles-item')}>
                    Max –{' '}
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
    const getQuartiles = createGetQuartiles();
    const getPDF = createGetPDF();
    const getECDF = createGetECDF();
    const getIsDataGood = createGetIsDataGood();

    return (state, props) => {
        const quartiles = getQuartiles(state, props);
        const pdf = getPDF(state, props);
        const ecdf = getECDF(state, props);
        const isDataGood = getIsDataGood(state, props);

        return {quartiles, pdf, ecdf, isDataGood};
    };
};

export default connect(makeMapStateToProps)(Histogram);
