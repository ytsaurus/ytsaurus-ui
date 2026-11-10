import React from 'react';
import {DatePicker} from '@gravity-ui/date-components';
import {type DateTime, dateTimeParse} from '../../../../../utils/date-utils';
import {Flex} from '@gravity-ui/uikit';
import i18n from './i18n';

type DateFilterValue = {from?: number; to?: number};
type Props = {value: DateFilterValue; onChange: (value: DateFilterValue) => void};

export function QueryDateFilterField({value, onChange}: Props) {
    return (
        <Flex alignItems="center" gap={1}>
            <DatePicker
                placeholder={i18n('context_start-date')}
                format="DD.MM.YYYY"
                value={value.from ? dateTimeParse(value.from) : null}
                onUpdate={(next?: DateTime | null) => onChange({...value, from: next?.valueOf()})}
                hasClear
            />{' '}
            &mdash;
            <DatePicker
                placeholder={i18n('context_end-date')}
                format="DD.MM.YYYY"
                value={value.to ? dateTimeParse(value.to)?.startOf('day') : null}
                onUpdate={(next?: DateTime | null) =>
                    onChange({...value, to: next?.endOf('day').valueOf()})
                }
                hasClear
            />
        </Flex>
    );
}
