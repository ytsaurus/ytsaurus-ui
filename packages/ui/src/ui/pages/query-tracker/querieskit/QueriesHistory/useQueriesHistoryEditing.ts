import React from 'react';
import {type QueryListEditingConfig, type QueryListRowAction} from '@gravity-ui/querieskit';

import {setQueryName} from '../../../../store/actions/query-tracker/queryAnnotations';
import {useDispatch} from '../../../../store/redux-hooks';
import {CompletedStates} from '../../../../types/query-tracker';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import i18n from '../../QueriesList/i18n';
import {type HistoryRow} from './types';

export function useQueriesHistoryEditing() {
    const dispatch = useDispatch();
    const [editingId, setEditingId] = React.useState<string>();

    const handleSubmit = async (item: HistoryRow, title: string) => {
        try {
            await wrapApiPromiseByToaster(dispatch(setQueryName(item.queryItem.id, title)), {
                toasterName: `edit_query_name_${item.id}`,
                skipSuccessToast: true,
                errorTitle: i18n('title_edit-query-name-error'),
            });
            setEditingId(undefined);
        } catch (_) {}
    };

    const getRowActions = (item: HistoryRow): QueryListRowAction<HistoryRow>[] => {
        if (!CompletedStates.includes(item.queryItem.state)) {
            return [];
        }

        return [
            {
                text: i18n('action_edit'),
                onClick: () => setEditingId(item.id.toString()),
            },
        ];
    };

    const editing: QueryListEditingConfig<HistoryRow> = {
        rowId: editingId,
        onSubmit: handleSubmit,
        onCancel: () => setEditingId(undefined),
    };

    return {editing, getRowActions};
}
