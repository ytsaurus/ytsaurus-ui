import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';
import {configureStore} from '@reduxjs/toolkit';
import {createMemoryHistory} from 'history';
import {Provider} from 'react-redux';
// @ts-ignore
import {listenForHistoryChange} from 'redux-location-state';

import {UPDATE_VIEW} from '../../../../../constants/navigation';
import {GET_TABLE_DATA, SET_COLUMNS} from '../../../../../constants/navigation/content/table';
import getLocationMiddleware from '../../../../../state-url-mapping';
import {rootApi} from '../../../../../store/api';
import {
    getTableData,
    updateTableData,
} from '../../../../../store/actions/navigation/content/table/table';
import {makeRootReducer} from '../../../../../store/reducers/index.main';
import {useSelector} from '../../../../../store/redux-hooks';
import {
    selectColumns,
    selectRows,
    selectYqlTypes,
} from '../../../../../store/selectors/navigation/content/table-ts';
import {selectTableYsonSettings} from '../../../../../store/selectors/thor/unipika';
import {setWindowStoreAndHistory} from '../../../../../store/window-store';
import DataTableWrapper from '../DataTableWrapper/DataTableWrapper';
import OffsetSelectorModal from '../OffsetSelectorModal/OffsetSelectorModal';

const ConnectedOffsetSelectorModal = OffsetSelectorModal as unknown as React.ComponentType;
const sourcePath = '//home/source';
const destinationPath = '//home/empty';
const url = (path: string) => '/Cluster/navigation?' + new URLSearchParams({path});

function createStoryNavigation() {
    const history = createMemoryHistory();
    const rootReducer = makeRootReducer();
    const {locationMiddleware, reducersWithLocation} = getLocationMiddleware(history, rootReducer);
    const store = configureStore({
        reducer: reducersWithLocation as typeof rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({serializableCheck: false, immutableCheck: false}).concat(
                locationMiddleware,
                rootApi.middleware,
            ),
    });
    listenForHistoryChange(store, history);
    history.push(url(sourcePath));
    loadFixture(
        store,
        'source_key',
        [{source_key: [['source-value'], 0]}],
        [['OptionalType', ['DataType', 'String']]],
    );
    return {history, store};
}

function loadFixture(
    store: ReturnType<typeof createStoryNavigation>['store'],
    column: string,
    rows: Array<Record<string, [string[], number]>>,
    yqlTypes: Array<['OptionalType', ['DataType', 'String']]>,
) {
    store.dispatch({
        type: UPDATE_VIEW.SUCCESS,
        data: {
            attributes: {
                dynamic: true,
                sorted: true,
                key_columns: [column],
                schema: {
                    $value: [{name: column, type: 'string', sort_order: 'ascending'}],
                    $attributes: {strict: true},
                },
            },
        },
    });
    store.dispatch({
        type: SET_COLUMNS,
        data: {
            columns: [{name: column, checked: true, keyColumn: true}],
            omittedColumns: [],
            deniedKeyColumns: [],
        },
    });
    store.dispatch({type: GET_TABLE_DATA.SUCCESS, data: {rows, yqlTypes}});
}

function TablePreview() {
    const rows = useSelector(selectRows);
    const yqlTypes = useSelector(selectYqlTypes);
    const columns = useSelector(selectColumns);
    const loaded = useSelector((state) => state.navigation.content.table.loaded);
    const ysonSettings = useSelector(selectTableYsonSettings);
    const keyColumns = columns.filter((column) => column.keyColumn).map((column) => column.name);

    return (
        <section aria-label="Table preview" style={{width: 760, minHeight: 240}}>
            <DataTableWrapper
                isFullScreen={false}
                loading={false}
                loaded={loaded}
                columns={columns}
                keyColumns={keyColumns}
                yqlTypes={yqlTypes || undefined}
                ysonSettings={ysonSettings}
                data={rows}
            />
            <ConnectedOffsetSelectorModal />
        </section>
    );
}

function EmptyDestination() {
    const [{history, store}] = React.useState(createStoryNavigation);
    React.useLayoutEffect(() => {
        setWindowStoreAndHistory(store, history);
    }, [store, history]);
    const [readCount, setReadCount] = React.useState(0);
    const read = async (preload: boolean) => {
        await store.dispatch(preload ? getTableData() : updateTableData());
        setReadCount((count) => count + 1);
    };
    return (
        <Provider store={store}>
            <button onClick={() => history.push(url(destinationPath))}>Open empty table</button>
            <button onClick={() => loadFixture(store, 'destination_key', [], [])}>
                Complete empty table read
            </button>
            <button onClick={() => read(false)}>Refresh</button>
            <button onClick={() => read(true)}>Load table</button>
            <span>Completed reads: {readCount}</span>
            <TablePreview />
        </Provider>
    );
}

const meta: Meta<typeof EmptyDestination> = {
    title: 'Pages/Navigation/Table/Navigation',
    component: EmptyDestination,
};

export default meta;
type Story = StoryObj<typeof EmptyDestination>;

export const EmptyTable: Story = {};
