import React, {useEffect, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Button, Flex, Switch} from '@gravity-ui/uikit';
import {type Type, getSchemaDateType, parseV3Type} from '@ytsaurus/components';

import {patchQueryResultSettings} from '../../../../../store/actions/query-tracker/queryResult';
import {QueryResultsViewMode} from '../../../../../types/query-tracker/queryResult';

import {QueryExecutionView} from '../QueryExecutionView';
import {ResultView} from '../../ResultView';
import type {ResultMode} from '../../QueryEditor';
import FlexSplitPane from '../../../../../components/FlexSplitPane/FlexSplitPane';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {selectCluster} from '../../../../../store/selectors/global';
import {SUPPORTED_FEATURES_SUCCESS} from '../../../../../constants/global';
import {
    type QueryResultTab,
    setActiveTab,
    setTabs,
} from '../../../../../store/reducers/query-tracker/queryTabsSlice';
import {loadVisualization} from '../../../../../store/actions/query-tracker/queryChart';
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

type SchemaExample = 'optional' | 'nested' | 'empty';
const schemaPrimitiveTypes = new Set(['string', 'int64', 'float']);
const optionalColumns = [
    {name: 'ss1.ca_county', item: 'string'},
    {name: 'ss1.d_year', item: 'int64'},
    {name: 'web_q1_q2_increase', item: 'float'},
    {name: 'store_q1_q2_increase', item: 'float'},
    {name: 'web_q2_q3_increase', item: 'float'},
    {name: 'store_q2_q3_increase', item: 'float'},
].map(({name, item}) => ({name, type_v3: {type_name: 'optional', item} as Type}));
const nestedType: Type = {
    type_name: 'struct',
    members: [
        {name: 'id', type: 'int64'},
        {
            name: 'payload',
            type: {
                type_name: 'optional',
                item: {
                    type_name: 'tagged',
                    tag: 'json',
                    item: 'string',
                },
            },
        },
        {
            name: 'items',
            type: {
                type_name: 'list',
                item: {
                    type_name: 'struct',
                    members: [{name: 'value', type: 'string'}],
                },
            },
        },
    ],
};

function Example({
    initialTab = 'result/0',
    schemaExample,
}: {
    initialTab?: QueryResultTab;
    schemaExample?: SchemaExample;
}) {
    const dispatch = useDispatch();
    const cluster = useSelector(selectCluster);
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
                        {name: 'label', displayName: 'label', type: {name: 'String', simple: true}},
                    ],
                    results: ['A', 'B', 'C'].map((label, row) => ({
                        value: prepareFormattedValue(String(Number(value) + row), [
                            'DataType',
                            'Int64',
                        ]),
                        label: prepareFormattedValue(label, ['DataType', 'String']),
                    })),
                    rawResult: {
                        all_column_names: ['value', 'label'],
                        incomplete_all_column_names: false,
                        incomplete_columns: false,
                        rows: ['A', 'B', 'C'].map((label, row) => ({
                            value: [String(Number(value) + row), '0'],
                            label: [label, '1'],
                        })),
                        yql_type_registry: [
                            ['DataType', 'Int64'],
                            ['DataType', 'String'],
                        ],
                    },
                    meta: {
                        schema: {
                            $value: [
                                {name: 'value', type_v3: 'int64'},
                                {name: 'label', type_v3: 'string'},
                            ],
                        },
                        data_statistics: {row_count: 100},
                        is_truncated: true,
                    } as unknown as QueryResultMeta,
                },
            });
        }
        if (schemaExample) {
            dispatch({
                type: SUPPORTED_FEATURES_SUCCESS,
                data: {
                    featuresCluster: cluster,
                    features: {primitive_types: [...schemaPrimitiveTypes]},
                },
            });
            const schema =
                schemaExample === 'nested'
                    ? Array.from({length: 20}, (_, index) => ({
                          name: `nested_column_${index}_with_a_very_long_name_for_schema_layout`,
                          type_v3: nestedType,
                      }))
                    : optionalColumns;
            const hasRows = schemaExample === 'optional';
            // Wire types intentionally omit Optional: Schema must use metadata.
            const wireTypes = optionalColumns.map(({type_v3}) =>
                parseV3Type((type_v3 as {item: string}).item, schemaPrimitiveTypes),
            );
            const values = ['county', '2026', '1.5', '2.5', '3.5', '4.5'];
            dispatch({
                type: SET_QUERY_RESULTS,
                data: {
                    queryId: query.id,
                    index: 0,
                    columns: schema.map(({name, type_v3}) => ({
                        name,
                        displayName: name,
                        type: getSchemaDateType(parseV3Type(type_v3, schemaPrimitiveTypes)),
                    })),
                    results: hasRows
                        ? [
                              Object.fromEntries(
                                  schema.map(({name}, index) => [
                                      name,
                                      prepareFormattedValue(values[index], wireTypes[index]),
                                  ]),
                              ),
                          ]
                        : [],
                    rawResult: {
                        all_column_names: schema.map(({name}) => name),
                        incomplete_all_column_names: false,
                        incomplete_columns: false,
                        rows: hasRows
                            ? [
                                  Object.fromEntries(
                                      schema.map(({name}, index) => [
                                          name,
                                          [values[index], String(index)],
                                      ]),
                                  ),
                              ]
                            : [],
                        yql_type_registry: hasRows ? wireTypes : [],
                    },
                    meta: {
                        schema: {$value: schema},
                        data_statistics: {row_count: hasRows ? 1 : 0},
                        is_truncated: false,
                    } as unknown as QueryResultMeta,
                },
            });
            dispatch(
                patchQueryResultSettings(query.id, 0, {
                    viewMode: QueryResultsViewMode.Scheme,
                    visibleColumns: [schema[0].name],
                }),
            );
        }
        dispatch(loadVisualization());
        dispatch(
            setTabs([
                {id: 'result/0', title: 'Result #1'},
                {id: 'result/1', title: 'Result #2'},
                {id: 'chart-tab/0', title: 'Charts #1'},
                {id: 'chart-tab/1', title: 'Charts #2'},
                {id: 'progress', title: 'Progress'},
                {id: 'statistic', title: 'Statistics'},
                {id: 'error', title: 'Error'},
                {id: 'meta', title: 'Metadata'},
            ]),
        );
        dispatch(setActiveTab(initialTab));
        setReady(true);
    }, [dispatch, initialTab, schemaExample, cluster]);
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

const meta: Meta<typeof Example> = {
    title: 'Pages/QueryTracker/QueryExecutionView',
    component: Example,
};
export default meta;
export const Default: StoryObj = {};
export const Charts: StoryObj<typeof Example> = {args: {initialTab: 'chart-tab/0'}};

export const Schema: StoryObj<typeof Example> = {args: {schemaExample: 'optional'}};
export const SchemaNested: StoryObj<typeof Example> = {args: {schemaExample: 'nested'}};
export const SchemaEmpty: StoryObj<typeof Example> = {args: {schemaExample: 'empty'}};
