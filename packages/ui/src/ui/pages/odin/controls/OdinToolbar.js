import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Checkbox} from '@gravity-ui/uikit';
import Select from '../../../components/Select/Select';
import {Datepicker} from '../../../components/common/Datepicker';

import block from 'bem-cn-lite';
import _ from 'lodash';

import {getDate, getMetric, getOdinCluster, getStat, getUseCurrentDate} from '../_selectors';
import {setDate, setMetric, toggleUseCurrentDate} from '../_actions';
import Utils from '../odin-utils';
import hammer from '../../../common/hammer';

const odinCN = block('odin');

const tbBlock = block('elements-toolbar');

function useLoadMetricsList() {
    const [metrics, setMetrics] = useState([]);
    const cluster = useSelector(getOdinCluster);

    useEffect(() => {
        Utils.listMetrics(cluster).then((metrics) => {
            setMetrics(
                _.map(metrics, ({name, display_name: text}) => ({
                    value: name,
                    text,
                })),
            );
        });
    }, []);

    return metrics;
}

function MetricSelector() {
    const metric = useSelector(getMetric);
    const dispatch = useDispatch();
    const metrics = useLoadMetricsList();
    const handleChange = useCallback((value) => {
        dispatch(setMetric(value));
    }, []);

    if (metrics.length > 0 && _.findIndex(metrics, ({value}) => value === metric) === -1) {
        dispatch(setMetric(metrics[0].value));
    }

    return (
        <Select
            value={[metric]}
            label="Check:"
            items={metrics}
            onUpdate={(vals) => handleChange(vals[0])}
            showSearch={true}
            width="max"
        />
    );
}

function UseCurrentDate() {
    const useCurrentDate = useSelector(getUseCurrentDate);
    const dispatch = useDispatch();
    const handleChange = useCallback(() => {
        dispatch(toggleUseCurrentDate());
    }, []);

    return (
        <Checkbox
            size="l"
            content="Current date"
            checked={useCurrentDate}
            onChange={handleChange}
        />
    );
}

function CustomDate() {
    const date = useSelector(getDate);
    const dispatch = useDispatch();
    const handleChange = useCallback(({from}) => {
        dispatch(setDate(from));
    }, []);

    return (
        <Datepicker
            range={false}
            from={date}
            to={date}
            scale="day"
            hasClear={false}
            controlWidth={180}
            onUpdate={handleChange}
        />
    );
}

function Toolbar({className}) {
    const stat = useSelector(getStat);
    return (
        <div className={className}>
            <div className={odinCN('toolbar-metric-filter', tbBlock('component'))}>
                <MetricSelector />
            </div>
            <div className={odinCN('toolbar-date-filter', tbBlock('component'))}>
                <CustomDate />
            </div>
            <div className={odinCN('toolbar-current-date', tbBlock('component'))}>
                <UseCurrentDate />
            </div>
            <div className={odinCN('toolbar-availability-message', tbBlock('component'))}>
                <div className="elements-message elements-message_theme_info">
                    <p className="elements-message__paragraph">
                        We were available from <em>{hammer.format.Percent(stat.from * 100)}</em> to{' '}
                        <em>{hammer.format.Percent(stat.to * 100)}</em> of time.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Toolbar;
