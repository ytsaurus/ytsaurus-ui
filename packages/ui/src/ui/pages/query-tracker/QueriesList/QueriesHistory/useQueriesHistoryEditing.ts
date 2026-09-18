import React from 'react';
import {type QueryListEditingConfig, type QueryListRowAction} from '@gravity-ui/querieskit';

import {setQueryName} from '../../../../store/actions/query-tracker/api';
import {updateQueryAnnotations} from '../../../../store/actions/query-tracker/query';
import {useDispatch} from '../../../../store/redux-hooks';
import {QueryStatus} from '../../../../types/query-tracker';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import i18n from '../i18n';
import {type HistoryRow} from './types';

const EDITABLE_STATUSES = new Set<QueryStatus>([
    QueryStatus.DRAFT,
    QueryStatus.ABORTED,
    QueryStatus.COMPLETED,
    QueryStatus.FAILED,
]);

export function useQueriesHistoryEditing() {
    const dispatch = useDispatch();
    const [editingId, setEditingId] = React.useState<string>();

    const handleSubmit = React.useCallback(
        async (item: HistoryRow, title: string) => {
            const annotations = {...item.queryItem.annotations, title};
            try {
                await wrapApiPromiseByToaster(
                    dispatch(setQueryName(item.queryItem.id, annotations)),
                    {
                        toasterName: `edit_query_name_${item.id}`,
                        skipSuccessToast: true,
                        errorTitle: i18n('title_edit-query-name-error'),
                    },
                );
                dispatch(updateQueryAnnotations(item.queryItem.id, annotations));
                setEditingId(undefined);
            } catch (_) {}
        },
        [dispatch],
    );

    const handleCancel = React.useCallback(() => setEditingId(undefined), []);

    const getRowActions = React.useCallback(
        (item: HistoryRow): QueryListRowAction<HistoryRow>[] => {
            if (!EDITABLE_STATUSES.has(item.queryItem.state)) {
                return [];
            }

            return [
                {
                    text: i18n('action_edit'),
                    onClick: () => setEditingId(item.id.toString()),
                },
            ];
        },
        [],
    );

    const editing = React.useMemo<QueryListEditingConfig<HistoryRow>>(
        () => ({rowId: editingId, onSubmit: handleSubmit, onCancel: handleCancel}),
        [editingId, handleCancel, handleSubmit],
    );

    return {editing, getRowActions};
}
