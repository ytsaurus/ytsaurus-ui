import React, {useCallback} from 'react';

import ColumnHeader, {
    type ColumnHeaderOnSort,
} from '../../../../../components/ColumnHeader/ColumnHeader';
import {setAccountUsageSortState} from '../../../../../store/actions/accounts/account-usage';
import {
    type AccountUsageField,
    type AccountUsageVersionedField,
} from '../../../../../store/reducers/accounts/usage/account-usage-types';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {
    readableAccountUsageColumnName,
    selectAccountUsageSortStateByColumn,
} from '../../../../../store/selectors/accounts/account-usage';

type OnSort = ColumnHeaderOnSort<AccountUsageField | AccountUsageVersionedField>;

type Props = {
    column: AccountUsageField;
    versionedColumn: AccountUsageVersionedField;
};

export const VersionedHeader = ({column, versionedColumn}: Props) => {
    const dispatch = useDispatch();

    const sortState = useSelector(selectAccountUsageSortStateByColumn);

    const onSort = useCallback<OnSort>(
        (columnName, nextOrder, options) => {
            dispatch(
                setAccountUsageSortState({column: columnName, order: nextOrder}, options.multisort),
            );
        },
        [dispatch],
    );

    const columnTitle = readableAccountUsageColumnName(column);

    const versionedSortState = sortState[versionedColumn];
    const activeColumn = versionedSortState ? versionedColumn : column;
    const activeSortState = versionedSortState ?? sortState[column];

    return (
        <ColumnHeader
            column={activeColumn}
            title={columnTitle}
            order={activeSortState?.order}
            multisortIndex={activeSortState?.multisortIndex}
            onSort={onSort}
            options={[
                {column, title: 'Committed'},
                {column: versionedColumn, title: 'Uncommitted'},
            ]}
        />
    );
};
