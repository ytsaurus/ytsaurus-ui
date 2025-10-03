import React, {useCallback, useEffect, useState} from 'react';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../../../store/reducers';
import {Select, SelectOption} from '@gravity-ui/uikit';
import {getQueryResult} from '../../../../store/selectors/queries/queryResult';
import SimplePagination from '../../../../components/Pagination/SimplePagination';
import {applySettings, updateQueryResult} from '../../../../store/actions/queries/queryResult';
import {QueryResultReadyState} from '../../../../types/query-tracker/queryResult';
import './index.scss';

type Props = {
    queryId: string;
    resultIndex: number;
    className?: string;
};

const b = block('query-result-paginator');

const options: SelectOption[] = [
    {
        value: String(10),
        content: '10',
    },
    {
        value: String(50),
        content: '50',
    },
    {
        value: String(100),
        content: '100',
    },
    {
        value: String(200),
        content: '200',
    },
];
type PaginationSettings = {lastPage: number; pageSize: number};
function useQueryResultPagination(
    queryId: string,
    resultIndex: number,
): [number, PaginationSettings] {
    const [paginationSettings, setSettings] = useState<PaginationSettings>({
        lastPage: 0,
        pageSize: 0,
    });

    const result = useSelector((state: RootState) => getQueryResult(state, queryId, resultIndex));

    useEffect(() => {
        if (result?.resultReady) {
            const lastPage =
                Math.ceil(
                    (result?.meta.data_statistics.row_count || 0) /
                        (result?.settings.pageSize || 1),
                ) - 1;
            setSettings({
                pageSize: result?.settings.pageSize || 0,
                lastPage,
            });
        }
    }, [result]);

    const page = (result as QueryResultReadyState)?.page || 0;

    return [page, paginationSettings];
}

export function ResultPaginator({queryId, resultIndex, className}: Props) {
    const dispatch = useDispatch();
    const [page, {pageSize, lastPage}] = useQueryResultPagination(queryId, resultIndex);

    const setPageSize = useCallback(
        ([pageSize]: string[]) => {
            dispatch(
                applySettings(queryId, resultIndex, {
                    pageSize: Number(pageSize),
                }),
            );
        },
        [dispatch],
    );

    const goToPage = useCallback(
        (page: number) => {
            dispatch(updateQueryResult(queryId, resultIndex, page));
        },
        [queryId],
    );

    return (
        <div className={b(null, className)}>
            <Select
                className={b('control')}
                value={[pageSize.toString()]}
                options={options}
                onUpdate={setPageSize}
            />
            <SimplePagination
                className={b('control')}
                value={page}
                min={0}
                max={lastPage}
                onChange={goToPage}
                step={1}
            />
        </div>
    );
}
