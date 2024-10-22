import React, {useCallback} from 'react';
import {Gear} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import Button from '../../../../components/Button/Button';
import {DialogField, DialogTabField, FormApi, YTDFDialog} from '../../../../components/Dialog';
import type {ChartSettings} from '../types';
import {useDispatch, useSelector} from 'react-redux';
import {selectQueryResultChartSettings} from '../../module/queryChart/selectors';
import {setChartSettings} from '../../module/queryChart/queryChartSlice';
import {useToggle} from 'react-use';

type FormValues = ChartSettings;

function pixelIntervalValidator(value: string) {
    return !value || /^\d+$/.test(value) ? undefined : 'Should be a number';
}

const extras = {
    options: [
        {
            value: 'on',
            label: 'On',
        },
        {
            value: 'off',
            label: 'Off',
        },
    ],
};

const xAxisTab: DialogTabField<DialogField<FormValues>> = {
    type: 'tab',
    name: 'xAxis',
    title: 'X axis',
    fields: [
        {
            name: 'legend',
            caption: 'Legend',
            type: 'radio',
            extras,
        },
        {
            name: 'labels',
            caption: 'Labels',
            type: 'radio',
            extras,
        },
        {
            caption: 'Title',
            name: 'title',
            type: 'text',
        },
        {
            caption: 'Grid step, px',
            name: 'pixelInterval',
            type: 'text',
            validator: pixelIntervalValidator,
        },
    ],
};

const yAxisTab: DialogTabField<DialogField<FormValues>> = {
    type: 'tab',
    name: 'yAxis',
    title: 'Y axis',
    fields: [
        {
            name: 'labels',
            caption: 'Labels',
            type: 'radio',
            extras,
        },
        {
            caption: 'Title',
            name: 'title',
            type: 'text',
        },
        {
            name: 'grid',
            caption: 'Grid',
            type: 'radio',
            extras,
        },
        {
            caption: 'Grid step, px',
            name: 'pixelInterval',
            type: 'text',
            validator: pixelIntervalValidator,
        },
    ],
};

const fields: DialogTabField<DialogField<FormValues>>[] = [xAxisTab, yAxisTab];

export function ChartSettingsComponent() {
    const [visible, toggleVisibility] = useToggle(false);
    const chartSettings = useSelector(selectQueryResultChartSettings);
    const dispatch = useDispatch();

    const handleOnAdd = useCallback(
        (form: FormApi<FormValues, Partial<FormValues>>) => {
            dispatch(setChartSettings(form.getState().values));
            return Promise.resolve();
        },
        [dispatch],
    );

    return (
        <span>
            <Button onClick={toggleVisibility}>
                <Icon data={Gear} size={16} />
            </Button>
            <YTDFDialog<FormValues>
                visible={visible}
                initialValues={chartSettings}
                onClose={toggleVisibility}
                onAdd={handleOnAdd}
                fields={fields}
            />
        </span>
    );
}
