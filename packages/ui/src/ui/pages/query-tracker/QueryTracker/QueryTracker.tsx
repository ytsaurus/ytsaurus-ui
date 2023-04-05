import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Switch, Route} from 'react-router';
import FlexSplitPane from '../../../components/FlexSplitPane/FlexSplitPane';
import {QueriesPooling} from '../hooks/QueriesPooling/context';
import {isEngine, QueryEngine} from '../module/api';
import {
    createEmptyQuery,
    createQueryFromTablePath,
    goToQuery,
    loadQuery,
} from '../module/query/actions';
import {getQueryGetParams} from '../module/query/selectors';
import {QueriesList} from '../QueriesList';
import {QueryEditor} from '../QueryEditor/QueryEditor';
import './QueryTracker.scss';

type Props = {
    match: {
        path: string;
        params: {
            queryId?: string;
        };
    };
    location: {
        search: string;
    };
};

const initialSizes = [23, 77];
const minSize = 380; // see history list's cells size

function DefaultQueriesPage() {
    const dispatch = useDispatch();
    const routeParams = useSelector(getQueryGetParams);

    useEffect(() => {
        const engine =
            routeParams.engine && isEngine(routeParams.engine)
                ? (routeParams.engine as QueryEngine)
                : QueryEngine.YQL;
        if (routeParams.cluster && routeParams.path) {
            dispatch(createQueryFromTablePath(engine, routeParams.cluster, routeParams.path));
        } else {
            dispatch(createEmptyQuery(engine));
        }
    }, [dispatch, routeParams]);
    return null;
}

function QueryPage(props: Props) {
    const dispatch = useDispatch();

    useEffect(() => {
        if (props.match.params.queryId) {
            dispatch(loadQuery(props.match.params.queryId));
        } else {
            dispatch(createEmptyQuery());
        }
    }, [dispatch, props.match.params.queryId]);
    return null;
}

export const QueryTracker = ({match}: Props) => {
    const [sizes, setSize] = useState(initialSizes);
    const getSize = useMemo(() => {
        return () => sizes;
    }, [sizes]);
    const dispatch = useDispatch();

    const goToCreatedQuery = useCallback(
        (queryId: string) => {
            dispatch(goToQuery(queryId));
            return true;
        },
        [dispatch],
    );
    return (
        <>
            <Switch>
                <Route exact path={match.path} component={DefaultQueriesPage} />
                <Route path={`${match.path}/:queryId`} component={QueryPage} />
            </Switch>
            <QueriesPooling>
                <FlexSplitPane
                    className="query-tracker-page-container"
                    direction={FlexSplitPane.HORIZONTAL}
                    onResizeEnd={setSize}
                    minSize={minSize}
                    getInitialSizes={getSize}
                >
                    <QueriesList />

                    <QueryEditor onStartQuery={goToCreatedQuery}></QueryEditor>
                </FlexSplitPane>
            </QueriesPooling>
        </>
    );
};
