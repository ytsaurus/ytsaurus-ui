import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {COMPONENTS_NODES_TABLE_ID} from '../../../../../constants/components/nodes/nodes';
import ColumnHeader, {
    ColumnHeaderProps,
    HasSortColumn,
} from '../../../../../components/ColumnHeader/ColumnHeader';
import {toggleColumnSortOrder} from '../../../../../store/actions/tables';
import {getTables} from '../../../../../store/selectors/tables';
import {NodesTableColumnNames} from '../../../../../pages/components/tabs/nodes/tables';
import {oldSortStateToOrderType} from '../../../../../utils/sort-helpers';

export function NodesColumnHeader(
    props: HasSortColumn<NodesTableColumnNames> & Pick<ColumnHeaderProps, 'align'>,
) {
    const dispatch = useDispatch();
    const sortState = useSelector(getTables)[COMPONENTS_NODES_TABLE_ID];
    const order = oldSortStateToOrderType(sortState);

    const column = props.options?.find(({column}) => sortState.field === column);

    return (
        <ColumnHeader
            {...props}
            column={props.options ? column?.column ?? props.column : props.column}
            order={column ? order : undefined}
            onSort={(columnName) => {
                const colInfo = props.options?.find(({column}) => columnName === column);
                dispatch(
                    toggleColumnSortOrder({
                        columnName,
                        withUndefined: colInfo?.withUndefined,
                        allowUnordered: colInfo?.allowUnordered,
                        tableId: COMPONENTS_NODES_TABLE_ID,
                    }),
                );
            }}
        />
    );
}
