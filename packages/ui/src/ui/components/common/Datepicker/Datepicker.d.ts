import {PureComponent} from 'react';

import {TextInputProps, TextInputSize} from '@gravity-ui/uikit';

export type DatepickerScale = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface DatepickerOutputDates {
    scale?: DatepickerScale;
    from: string | null;
    to: string | null;
}

type DateType = string | number;

export interface DatepickerProps {
    onUpdate: (value: DatepickerOutputDates) => void;
    onError?: () => void;
    from?: DateType | null;
    to?: DateType | null;
    min?: DateType;
    max?: DateType;
    format?: string;
    outputFormat?: string;
    emptyValueText?: string;
    placeholder?: string;
    timezoneOffset?: number;
    scale?: DatepickerScale;
    availableScales?: DatepickerScale[];
    controlWidth?: number | string;
    range?: boolean;
    allowNullableValues?: boolean;
    showApply?: boolean;
    hasClear?: boolean;
    disabled?: boolean;
    controlSize?: TextInputSize;
    className?: string;
    popupClassName?: string;
    pin?: TextInputProps['pin'];
}

export const datepickerDefaultProps: Partial<DatepickerProps>;

export class Datepicker extends PureComponent<DatepickerProps> {}
