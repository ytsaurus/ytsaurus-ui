import React, {FC} from 'react';
import {Select} from '@gravity-ui/uikit';
import {FieldKey} from '../../../../../store/reducers/queries/queryChartSlice';
import './ChartField.scss';

type Props = {
    label: string;
    value: string;
    name: FieldKey;
    availableFields: string[];
    onChange: (data: {value: string; oldValue: string; name: FieldKey}) => void;
};

export const ChartField: FC<Props> = ({label, value, name, availableFields, onChange}) => {
    const handleOnChange = (val: string[]) => {
        onChange({value: val[0], oldValue: value, name});
    };

    return (
        <Select
            width="max"
            label={label}
            value={[value]}
            filterable
            options={availableFields.map((item) => ({
                content: item,
                value: item,
                data: item,
            }))}
            onUpdate={handleOnChange}
            hasClear
        />
    );
};
