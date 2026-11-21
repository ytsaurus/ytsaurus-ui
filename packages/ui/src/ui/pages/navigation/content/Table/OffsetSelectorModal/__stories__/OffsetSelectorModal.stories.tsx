import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';
import {freeze} from 'immer';

import {UPDATE_VIEW} from '../../../../../../constants/navigation';
import {
    GET_TABLE_DATA,
    OPEN_OFFSET_SELECTOR_MODAL,
    SET_COLUMNS,
} from '../../../../../../constants/navigation/content/table';
import {useDispatch, useSelector} from '../../../../../../store/redux-hooks';
import {
    selectRows,
    selectYqlTypes,
} from '../../../../../../store/selectors/navigation/content/table-ts';
import {selectTableYsonSettings} from '../../../../../../store/selectors/thor/unipika';
import DataTableWrapper from '../../DataTableWrapper/DataTableWrapper';
import OffsetSelectorModal from '../OffsetSelectorModal';

const ConnectedOffsetSelectorModal = OffsetSelectorModal as unknown as React.ComponentType;

const keyColumns = ['computation_id', 'stream_id', 'key', 'message_id'];

const data = freeze(
    {
        rows: [
            {
                computation_id: [['enrich'], 0],
                stream_id: [['input'], 0],
                key: [[['queue', [7, 42]]], 1],
                message_id: [['example-message-id'], 0],
            },
        ],
        yqlTypes: [
            ['OptionalType', ['DataType', 'String']],
            ['OptionalType', ['DataType', 'Yson']],
        ],
    },
    true,
);

function FrozenYsonKeyOffsetSelector() {
    const dispatch = useDispatch();
    const rows = useSelector(selectRows);
    const yqlTypes = useSelector(selectYqlTypes);
    const ysonSettings = useSelector(selectTableYsonSettings);

    React.useEffect(() => {
        dispatch({
            type: UPDATE_VIEW.SUCCESS,
            data: {attributes: {dynamic: true, sorted: true, key_columns: keyColumns}},
        });
        dispatch({
            type: SET_COLUMNS,
            data: {
                columns: keyColumns.map((name) => ({name, checked: true, keyColumn: true})),
                omittedColumns: [],
                deniedKeyColumns: [],
            },
        });
        dispatch({type: GET_TABLE_DATA.SUCCESS, data});
        dispatch({type: OPEN_OFFSET_SELECTOR_MODAL});
    }, [dispatch]);

    return (
        <>
            <DataTableWrapper
                isFullScreen={false}
                loading={false}
                loaded
                columns={keyColumns.map((name) => ({name}))}
                keyColumns={keyColumns}
                yqlTypes={yqlTypes || undefined}
                ysonSettings={ysonSettings}
                data={rows}
            />
            <ConnectedOffsetSelectorModal />
        </>
    );
}

const meta: Meta<typeof FrozenYsonKeyOffsetSelector> = {
    title: 'Pages/Navigation/Table/OffsetSelectorModal',
    component: FrozenYsonKeyOffsetSelector,
};

export default meta;
type Story = StoryObj<typeof FrozenYsonKeyOffsetSelector>;

export const FrozenYsonKey: Story = {};
