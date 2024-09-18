import React, {useCallback, useState} from 'react';
import {Gear} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import Button from '../../../../../components/Button/Button';
import {
    DialogField,
    DialogTabField,
    FormApi,
    YTDFDialog,
} from '../../../../../components/Dialog/Dialog';
import type {ChartSettings} from '../../types';
import {useSelector} from 'react-redux';
import {selectQueryResultChartSettings} from '../../store/selectors';
import {useThunkDispatch} from '../../../../../store/thunkDispatch';

type FormValues = ChartSettings;

function pixelIntervalValidator(value: string) {
    return !value || /^\d+$/.test(value) ? undefined : 'Should be a number';
}

const xAxisTab: DialogTabField<DialogField<FormValues>> = {
    type: 'tab',
    name: 'xAxis',
    title: 'X axis',
    fields: [
        {
            name: 'legend',
            caption: 'Legend',
            type: 'radio',
            extras: {
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
            },
        },
        {
            name: 'labels',
            caption: 'Labels',
            type: 'radio',
            extras: {
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
            },
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
            extras: {
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
            },
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
            extras: {
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
            },
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
    const [visible, setVisilbility] = useState(false);
    const chartSettings = useSelector(selectQueryResultChartSettings);
    const dispatch = useThunkDispatch();

    const handleOnOpen = useCallback(() => {
        setVisilbility(true);
    }, [setVisilbility]);

    const handleOnClose = useCallback(() => {
        setVisilbility(false);
    }, [setVisilbility]);

    const handleOnAdd = useCallback((form: FormApi<FormValues, Partial<FormValues>>) => {
        const data = form.getState().values;

        dispatch({
            type: 'set-chart-settings',
            data,
        });

        return Promise.resolve();
    }, []);

    return (
        <span>
            <Button onClick={handleOnOpen}>
                <Icon data={Gear} size={16} />
            </Button>
            <YTDFDialog<FormValues>
                visible={visible}
                initialValues={chartSettings}
                onClose={handleOnClose}
                onAdd={handleOnAdd}
                fields={fields}
            />
        </span>
    );
}
