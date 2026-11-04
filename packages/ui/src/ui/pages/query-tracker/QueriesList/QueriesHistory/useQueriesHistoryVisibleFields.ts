import React from 'react';
import {type QueryListFieldKey, type QueryListVisibleFieldsConfig} from '@gravity-ui/querieskit';

import {setSettingByKey} from '../../../../store/actions/settings';
import {useDispatch} from '../../../../store/redux-hooks';
import i18n from '../i18n';
import {type HistoryRow} from './types';

const SETTING_KEY = 'global::queryTracker::history::NewVisibleFields';
const VISIBLE_FIELDS = ['duration', 'mode', 'startTime', 'engine', 'isPrivate'] as const;
type VisibleField = (typeof VISIBLE_FIELDS)[number];
const DEFAULT_VISIBLE_FIELDS: VisibleField[] = [...VISIBLE_FIELDS];

export function useQueriesHistoryVisibleFields(
    storedFields?: string[],
): QueryListVisibleFieldsConfig<HistoryRow> {
    const dispatch = useDispatch();

    const value = React.useMemo<VisibleField[]>(() => {
        if (storedFields === undefined) {
            return DEFAULT_VISIBLE_FIELDS;
        }

        return storedFields.filter((field): field is VisibleField =>
            VISIBLE_FIELDS.includes(field as VisibleField),
        );
    }, [storedFields]);

    const handleChange = React.useCallback(
        (fields: QueryListFieldKey<HistoryRow>[]) => {
            dispatch(
                setSettingByKey(
                    SETTING_KEY,
                    fields.filter((field): field is VisibleField =>
                        VISIBLE_FIELDS.includes(field as VisibleField),
                    ),
                ),
            );
        },
        [dispatch],
    );

    return React.useMemo(
        () => ({
            value,
            fields: [
                {id: 'duration', title: i18n('field_duration')},
                {id: 'mode', title: i18n('field_mode')},
                {id: 'startTime', title: i18n('field_start-time')},
                {id: 'engine', title: i18n('field_engine')},
                {id: 'isPrivate', title: i18n('field_sharing')},
            ],
            onChange: handleChange,
        }),
        [handleChange, value],
    );
}
