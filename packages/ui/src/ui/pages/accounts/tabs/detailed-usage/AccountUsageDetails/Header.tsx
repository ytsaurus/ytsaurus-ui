import React, {useCallback} from 'react';

import ColumnHeader, {
    type ColumnHeaderOnSort,
} from '../../../../../components/ColumnHeader/ColumnHeader';
import {setAccountUsageSortState} from '../../../../../store/actions/accounts/account-usage';
import {type AccountUsageField} from '../../../../../store/reducers/accounts/usage/account-usage-types';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {
    readableAccountUsageColumnName,
    selectAccountUsageSortStateByColumn,
} from '../../../../../store/selectors/accounts/account-usage';

type OnSort = ColumnHeaderOnSort<AccountUsageField>;

type Props = {
    column: AccountUsageField;
};

export const Header = ({column}: Props) => {
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

    const {order, multisortIndex} = sortState[column] || {};

    return (
        <ColumnHeader
            column={column}
            title={readableAccountUsageColumnName(column)}
            order={order}
            onSort={onSort}
            multisortIndex={multisortIndex}
        />
    );
};
