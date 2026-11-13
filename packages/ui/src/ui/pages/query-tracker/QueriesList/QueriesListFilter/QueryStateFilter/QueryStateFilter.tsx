import React from 'react';
import {Select} from '@gravity-ui/uikit';
import {QueryStatus} from '../../../../../types/query-tracker';
import hammer from '../../../../../common/hammer';
import i18n from './i18n';

const ALL_STATUS_KEY = '__all';
const getStatusesList = () => [
    {
        value: ALL_STATUS_KEY,
        content: i18n('value_all'),
    },
    ...Object.values(QueryStatus).map((i) => {
        return {
            value: i,
            content: hammer.format.Readable(i),
        };
    }),
];

type Props = {
    value?: QueryStatus;
    onChange: (value: QueryStatus | undefined) => void;
};

export function QueryStateFilterField({value, onChange}: Props) {
    return (
        <Select
            width="max"
            options={getStatusesList()}
            value={[value || ALL_STATUS_KEY]}
            onUpdate={([next]) =>
                onChange(next === ALL_STATUS_KEY ? undefined : (next as QueryStatus))
            }
            placeholder={i18n('context_select-status')}
        />
    );
}
