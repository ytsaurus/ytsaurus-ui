import React, {type FC} from 'react';
import {Datepicker, type DatepickerProps, datepickerDefaultProps} from './Datepicker';

export * from './Datepicker';

export const DatePickerWrapper: FC<DatepickerProps> = (props) => <Datepicker {...props} />;
DatePickerWrapper.defaultProps = datepickerDefaultProps;
