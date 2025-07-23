import React, {FC, useCallback} from 'react';
import noop_ from 'lodash/noop';
import Pagination from '../../../../components/Pagination/Pagination';
import {useDispatch, useSelector} from 'react-redux';
import {getQueriesListCursor, hasQueriesListMore} from '../../module/queries_list/selectors';
import {loadNextQueriesList, requestQueriesList} from '../../module/queries_list/actions';
import {QueriesHistoryCursorDirection} from '../../module/query-tracker-contants';
import {setCursor} from '../../module/queries_list/queryListSlice';

export const ListPagination: FC = () => {
    const dispatch = useDispatch();
    const cursor = useSelector(getQueriesListCursor);
    const hasNext = useSelector(hasQueriesListMore);

    const goNext = useCallback(() => {
        dispatch(loadNextQueriesList(QueriesHistoryCursorDirection.PAST));
    }, [dispatch]);

    const goBack = useCallback(() => {
        dispatch(loadNextQueriesList(QueriesHistoryCursorDirection.FUTURE));
    }, [dispatch]);

    const first = useCallback(() => {
        dispatch(
            setCursor({
                cursorTime: undefined,
                direction: QueriesHistoryCursorDirection.PAST,
            }),
        );
        dispatch(requestQueriesList());
    }, [dispatch]);

    const isFirst =
        (cursor.direction === QueriesHistoryCursorDirection.FUTURE && !hasNext) ||
        (cursor.direction === QueriesHistoryCursorDirection.PAST && !cursor.cursorTime);

    const isLast =
        (cursor.direction === QueriesHistoryCursorDirection.PAST && !hasNext) ||
        (cursor.direction === QueriesHistoryCursorDirection.FUTURE && !cursor.cursorTime);

    return (
        <Pagination
            size="m"
            first={{
                handler: first,
                disabled: isFirst,
            }}
            previous={{
                handler: goBack,
                disabled: isFirst,
            }}
            next={{
                handler: goNext,
                disabled: isLast,
            }}
            last={{
                handler: noop_,
                disabled: true,
            }}
        />
    );
};
