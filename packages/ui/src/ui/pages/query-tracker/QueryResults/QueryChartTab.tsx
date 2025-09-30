import {FC, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import UIFactory from '../../../UIFactory';
import {QueryItem} from '../../../store/actions/queries/api';
import {loadQueryResult} from '../../../store/actions/queries/queryResult';

type Props = {
    query: QueryItem;
    resultIndex: number;
};

export const QueryChartTab: FC<Props> = (props) => {
    const {query, resultIndex} = props;
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(loadQueryResult(query.id, resultIndex));
    }, [dispatch, query.id, resultIndex]);

    return UIFactory.getQueryResultChartTab()?.renderContent(props) || null;
};
