import {type QueryListVisibleFieldsConfig} from '@gravity-ui/querieskit';

import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {selectQueryListHistoryColumns} from '../../../../store/selectors/query-tracker/queriesList';
import {setSettingByKey} from '../../../../store/actions/settings';
import {selectQueryListColumns} from '../../QueriesList/QueriesHistoryList/Columns/selectQueryListColumns';
import {type HistoryItem} from './adapters';
import historyI18n from './i18n';

const historyFields = {
    engine: 'Type',
    duration: 'Duration',
    startTime: 'Started',
    mode: 'Mode',
    isPrivate: 'Sharing',
};

export function useHistoryVisibleFields(): QueryListVisibleFieldsConfig<HistoryItem> {
    const dispatch = useDispatch();
    const storedColumns = useSelector(selectQueryListHistoryColumns);
    const {allowedColumns} = useSelector(selectQueryListColumns);

    const fields = [
        {id: 'engine', title: historyI18n('field_engine')},
        {id: 'duration', title: historyI18n('field_duration')},
        {id: 'startTime', title: historyI18n('field_started')},
        {id: 'mode', title: historyI18n('field_mode')},
        {id: 'isPrivate', title: historyI18n('field_sharing')},
    ] satisfies QueryListVisibleFieldsConfig<HistoryItem>['fields'];

    return {
        fields,
        value: fields
            .filter(({id}) => {
                if (id === 'mode' || id === 'isPrivate') {
                    // Missing keys in older settings mean these new fields are visible.
                    return !storedColumns?.includes(`${historyFields[id]}:hidden`);
                }
                return allowedColumns.some(
                    (column) => column.name === historyFields[id] && column.checked,
                );
            })
            .map(({id}) => id),
        onChange: (value) => {
            const managedKeys = fields.flatMap(({id}) => [
                historyFields[id],
                `${historyFields[id]}:hidden`,
            ]);
            const selectedColumns =
                storedColumns ??
                allowedColumns.filter(({checked}) => checked).map(({name}) => name);
            dispatch(
                setSettingByKey('global::queryTracker::history::Columns', [
                    ...selectedColumns.filter((name) => !managedKeys.includes(name)),
                    ...fields.filter(({id}) => value.includes(id)).map(({id}) => historyFields[id]),
                    ...fields
                        .filter(
                            ({id}) => (id === 'mode' || id === 'isPrivate') && !value.includes(id),
                        )
                        .map(({id}) => `${historyFields[id]}:hidden`),
                ]),
            );
        },
    };
}
