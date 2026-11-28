import React from 'react';
import {Select} from '@gravity-ui/uikit';
import {QueryStatus} from '../../../../../types/query-tracker';
import hammer from '../../../../../common/hammer';
import i18n from './i18n';

const ALL_STATUS_KEY = '__all';
const getStatusesList = () => [
    {value: ALL_STATUS_KEY, content: i18n('value_all')},
    ...Object.values(QueryStatus).map((value) => ({value, content: hammer.format.Readable(value)})),
];

type Props = {
    value?: QueryStatus;
    onUpdate: (value: QueryStatus | undefined) => void;
};

export function QueryStateFilter({value, onUpdate}: Props) {
    return (
        <Select
            width="max"
            options={getStatusesList()}
            value={[value || ALL_STATUS_KEY]}
            onUpdate={([state]) =>
                onUpdate(Object.values(QueryStatus).find((item) => item === state))
            }
            placeholder={i18n('context_select-status')}
            aria-label={i18n('context_select-status')}
        />
    );
}
