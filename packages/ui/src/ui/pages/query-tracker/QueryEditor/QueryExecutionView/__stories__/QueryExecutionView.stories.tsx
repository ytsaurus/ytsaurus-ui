import React, {useEffect, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Button, Flex, Switch} from '@gravity-ui/uikit';

import {QueryExecutionView} from '../QueryExecutionView';
import {ResultView} from '../../ResultView';
import type {ResultMode} from '../../QueryEditor';
import FlexSplitPane from '../../../../../components/FlexSplitPane/FlexSplitPane';
import {useDispatch} from '../../../../../store/redux-hooks';
import {setActiveTab, setTabs} from '../../../../../store/reducers/query-tracker/queryTabsSlice';
import {
    SET_QUERY,
    SET_QUERY_RESULTS,
} from '../../../../../store/reducers/query-tracker/query-tracker-contants';
import {QUERY_ACO_LOADING} from '../../../../../store/reducers/query-tracker/queryAco';
import {QueryStatus} from '../../../../../types/query-tracker';
import type {QueryItem, QueryResultMeta} from '../../../../../types/query-tracker/api';
import {QueryEngine} from '../../../../../../shared/constants/engines';
import {prepareFormattedValue} from '../../../../../utils/queries/format';
import '../../QueryEditor.scss';

const query: QueryItem = {
    id: 'execution-panel-example',
    engine: QueryEngine.YQL,
    supportedEngines: {yql: true, chyt: true, spyt: true, ql: true},
    query: 'select 42 as value',
    files: [],
    secrets: [],
    state: QueryStatus.COMPLETED,
    start_time: '2026-09-28T10:00:00Z',
    finish_time: '2026-09-28T10:00:03Z',
    user: 'test-user',
    result_count: 2,
    access_control_objects: ['everyone-share'],
    error: {
        message: 'Example diagnostic',
        code: 42,
        attributes: {start_position: {row: 1, column: 8}},
    },
    progress: {
        yql_statistics: {
            Map: {
                _id: 'operation-id',
                _cluster_name: 'test-cluster',
                Rows: {min: '1', max: '3', sum: '4', count: '2', last: '3'},
            },
        },
        yql_plan: {Basic: {nodes: [{id: 'op', name: 'Map', level: '0', type: 'op'}], links: []}},
        yql_progress: {
            op: {
                state: 'Finished',
                startedAt: '2026-09-28T10:00:00Z',
                finishedAt: '2026-09-28T10:00:03Z',
                total: 10,
                completed: 10,
                stages: {
                    Preparing: '2026-09-28T10:00:00Z',
                    Running: '2026-09-28T10:00:01Z',
                },
            },
        },
    },
};

function Example() {
    const dispatch = useDispatch();
    const [ready, setReady] = useState(false);
    const [modern, setModern] = useState(true);
    const [mode, setMode] = useState<ResultMode>('split');
    useEffect(() => {
        dispatch({type: SET_QUERY, data: {initialQuery: query}});
        dispatch({
            type: QUERY_ACO_LOADING.SUCCESS,
            data: {
                data: {
                    cluster_name: 'test-cluster',
                    query_tracker_stage: 'production',
                    access_control_objects: ['everyone-share', 'nobody'],
                    supported_features: {multiple_aco: true, access_control: true},
                },
            },
        });
        for (const index of [0, 1]) {
            const value = index ? '84' : '42';
            dispatch({
                type: SET_QUERY_RESULTS,
                data: {
                    queryId: query.id,
                    index,
                    columns: [
                        {name: 'value', displayName: 'value', type: {name: 'Int64', simple: true}},
                    ],
                    results: [{value: prepareFormattedValue(value, ['DataType', 'Int64'])}],
                    rawResult: {
                        all_column_names: ['value'],
                        incomplete_all_column_names: false,
                        incomplete_columns: false,
                        rows: [{value: [value, '0']}],
                        yql_type_registry: [['DataType', 'Int64']],
                    },
                    meta: {
                        schema: {$value: [{name: 'value', type_v3: 'int64'}]},
                        data_statistics: {row_count: 100},
                        is_truncated: true,
                    } as unknown as QueryResultMeta,
                },
            });
        }
        dispatch(
            setTabs([
                {id: 'result/0', title: 'Result #1'},
                {id: 'result/1', title: 'Result #2'},
                {id: 'progress', title: 'Progress'},
                {id: 'statistic', title: 'Statistics'},
                {id: 'error', title: 'Error'},
                {id: 'meta', title: 'Metadata'},
            ]),
        );
        dispatch(setActiveTab('result/0'));
        setReady(true);
    }, [dispatch]);
    const View = modern ? QueryExecutionView : ResultView;
    return (
        <Flex direction="column" gap={2} style={{height: 700, width: '100%'}}>
            <Flex gap={2}>
                <Switch content="New interface" checked={modern} onUpdate={setModern} />
                <Button onClick={() => setMode('split')}>Reset layout</Button>
            </Flex>
            {ready && (
                <FlexSplitPane
                    direction="vertical"
                    className={`query-container query-container_${mode}`}
                >
                    <React.Fragment>{mode !== 'full' && <div>Query editor</div>}</React.Fragment>
                    <View query={query} resultViewMode={mode} setResultViewMode={setMode} />
                </FlexSplitPane>
            )}
        </Flex>
    );
}

const meta: Meta = {title: 'Pages/QueryTracker/QueryExecutionView', component: Example};
export default meta;
export const Default: StoryObj = {};
