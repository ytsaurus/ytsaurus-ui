import React from 'react';

import {Datepicker, DatepickerProps} from '../../../../components/common/Datepicker';

type DatePickerControlProps = Omit<
    DatepickerProps,
    'from' | 'to' | 'onUpdate' | 'allowNullableValues'
> & {
    value?: Pick<DatepickerProps, 'from' | 'to'>;
    onChange: (v?: DatePickerControlProps['value']) => void;
};

export function DatePickerControl({value = {}, onChange, ...rest}: DatePickerControlProps) {
    return (
        <Datepicker
            {...rest}
            allowNullableValues
            {...value}
            onUpdate={(v) => {
                onChange(v);
            }}
        />
    );
}

DatePickerControl.getDefaultValue = () => {
    return undefined;
};
