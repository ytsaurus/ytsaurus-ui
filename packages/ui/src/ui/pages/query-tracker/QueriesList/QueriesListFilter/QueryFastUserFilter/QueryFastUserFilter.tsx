import React from 'react';
import {type ControlGroupOption, SegmentedRadioGroup} from '@gravity-ui/uikit';
import {QueriesListAuthorFilter} from '../../../../../types/query-tracker/queryList';
import {useSelector} from '../../../../../store/redux-hooks';
import {selectCurrentUserName} from '../../../../../store/selectors/global';
import i18n from './i18n';

const getAuthorFilter = (): ControlGroupOption[] => [
    {value: QueriesListAuthorFilter.My, content: i18n('value_my')},
    {value: QueriesListAuthorFilter.All, content: i18n('value_all')},
];

type Props = {
    value?: string;
    onUpdate: (value: string) => void;
};

export function QueryFastUserFilter({value, onUpdate}: Props) {
    const login = useSelector(selectCurrentUserName);
    const selected =
        value === QueriesListAuthorFilter.My || value === login
            ? QueriesListAuthorFilter.My
            : QueriesListAuthorFilter.All;

    return <SegmentedRadioGroup options={getAuthorFilter()} value={selected} onUpdate={onUpdate} />;
}
