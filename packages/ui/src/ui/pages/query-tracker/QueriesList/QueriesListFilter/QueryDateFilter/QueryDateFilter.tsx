import React from 'react';
import {DatePicker} from '@gravity-ui/date-components';
import {Flex} from '@gravity-ui/uikit';
import {dateTimeParse} from '../../../../../utils/date-utils';
import {type QueriesListFilter} from '../../../../../types/query-tracker/queryList';
import i18n from './i18n';

type Props = {
    value: Pick<QueriesListFilter, 'from' | 'to'>;
    onChange: (patch: Pick<QueriesListFilter, 'from' | 'to'>) => void;
};

export function QueryDateFilter({value: {from, to}, onChange}: Props) {
    return (
        <Flex alignItems="center" gap={1}>
            <DatePicker
                aria-label={i18n('context_start-date')}
                placeholder={i18n('context_start-date')}
                format="DD.MM.YYYY"
                value={from === undefined ? null : dateTimeParse(from)}
                onUpdate={(value) => onChange({from: value?.valueOf()})}
                hasClear
            />{' '}
            &mdash;
            <DatePicker
                aria-label={i18n('context_end-date')}
                placeholder={i18n('context_end-date')}
                format="DD.MM.YYYY"
                value={to === undefined ? null : dateTimeParse(to)?.startOf('day')}
                onUpdate={(value) => onChange({to: value?.endOf('day').valueOf()})}
                hasClear
            />
        </Flex>
    );
}
