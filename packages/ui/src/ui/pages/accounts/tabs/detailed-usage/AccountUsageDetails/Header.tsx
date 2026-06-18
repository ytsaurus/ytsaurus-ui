import React, {useCallback} from 'react';

import ColumnHeader from '../../../../../components/ColumnHeader/ColumnHeader';
import {setAccountUsageSortState} from '../../../../../store/actions/accounts/account-usage';
import {type AccountUsageDataItem} from '../../../../../store/reducers/accounts/usage/account-usage-types';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {
    readableAccountUsageColumnName,
    selectAccountUsageSortStateByColumn,
} from '../../../../../store/selectors/accounts/account-usage';
import {type OrderType} from '../../../../../utils/sort-helpers';

type Props = {
    column: keyof AccountUsageDataItem;
};

export const Header = ({column}: Props) => {
    const dispatch = useDispatch();

    const sortOrder = useSelector(selectAccountUsageSortStateByColumn);

    const onSort = useCallback(
        (column: string, nextOrder: OrderType, opts: {multisort?: boolean}) => {
            dispatch(setAccountUsageSortState({column, order: nextOrder}, opts.multisort));
        },
        [dispatch],
    );

    const {order, multisortIndex} = sortOrder[column] || {};

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
