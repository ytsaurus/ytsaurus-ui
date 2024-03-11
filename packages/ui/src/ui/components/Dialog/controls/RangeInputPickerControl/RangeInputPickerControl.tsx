import React from 'react';

import {
    RangeInputPicker,
    RangeInputPickerProps,
} from '../../../common/RangeInputPicker/RangeInputPicker';

import './RangeInputPickerControl.scss';

export type RangeInputPickerControlProps = Omit<RangeInputPickerProps, 'onUpdate'> & {
    onChange: (value: number) => void;
};

export function RangeInputPickerControl(props: RangeInputPickerControlProps) {
    const {onChange, ...rest} = props;
    return <RangeInputPicker {...rest} onUpdate={onChange} />;
}

RangeInputPickerControl.getDefaultValue = () => {
    return NaN;
};

RangeInputPickerControl.isEmpty = (v: number) => {
    return v === undefined;
};
