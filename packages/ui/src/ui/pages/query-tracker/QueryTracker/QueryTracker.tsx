import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Route, Switch} from 'react-router';
import FlexSplitPane from '../../../components/FlexSplitPane/FlexSplitPane';
import {QueriesPooling} from '../hooks/QueriesPooling/context';
import {QueryEngine, isEngine} from '../module/api';
import {
    SET_QUERY_PARAMS,
    createEmptyQuery,
    createQueryFromTablePath,
    goToQuery,
    loadQuery,
} from '../module/query/actions';
import {getQueryGetParams} from '../module/query/selectors';
import {QueriesList} from '../QueriesList';
import {Loader} from '@gravity-ui/uikit';
import './QueryTracker.scss';
import {getQueriesListSetting} from "../module/ui_settings/selectors";

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

const QueryEditorLazy = React.lazy(() => import('../QueryEditor/QueryEditor'));

const initialSizes = [23, 77];
const minSize = 380; // see history list's cells size

function QueryPageDraft() {
    const dispatch = useDispatch();
    const routeParams = useSelector(getQueryGetParams);

    useEffect(() => {
        const engine =
            routeParams.engine && isEngine(routeParams.engine)
                ? (routeParams.engine as QueryEngine)
                : QueryEngine.YQL;
        if (routeParams.cluster && routeParams.path) {
            if (routeParams.useDraft) {
                dispatch({
                    type: SET_QUERY_PARAMS,
                    data: {
                        params: {
                            ...routeParams,
                            useDraft: undefined,
                        },
                    },
                });
            }
            dispatch(
                createQueryFromTablePath(engine, routeParams.cluster, routeParams.path, {
                    useDraft: true,
                }),
            );
        } else {
            dispatch(createEmptyQuery(engine));
        }
    }, [dispatch]);
    return null;
}

function QueryPage(props: Props) {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch({
            type: SET_QUERY_PARAMS,
            data: {
                params: {},
            },
        });
        if (props.match.params.queryId) {
            dispatch(loadQuery(props.match.params.queryId));
        } else {
            dispatch(createEmptyQuery());
        }
    }, [dispatch, props.match.params.queryId]);
    return null;
}

export const QueryTracker = ({match}: Props) => {
    const isShowQueriesSettingPanel = useSelector(getQueriesListSetting);
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
                <Route exact path={match.path} component={QueryPageDraft} />
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
                    {isShowQueriesSettingPanel ? <QueriesList /> : null }
                    <React.Suspense fallback={<Loader />}>
                        <QueryEditorLazy onStartQuery={goToCreatedQuery}></QueryEditorLazy>
                    </React.Suspense>
                </FlexSplitPane>
            </QueriesPooling>
        </>
    );
};
