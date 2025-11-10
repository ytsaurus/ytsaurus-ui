import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';

import {WidgetHeader} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetHeader/WidgetHeader';
import {getMediumList} from '../../../../../../store/selectors/thor';
import {YTError} from '../../../../../../types';

import {useAccountsWidget} from '../hooks/use-accounts-widget';
import type {AccountsWidgetProps} from '../types';

import i18n from '../i18n';

export function AccountsWidgetHeader(props: AccountsWidgetProps) {
    const name = props?.data?.name;
    const {accounts, isLoading, userColumns} = useAccountsWidget(props);
    const mediumList = useSelector(getMediumList);

    const error = useMemo((): YTError | undefined => {
        if (!Array.isArray(userColumns)) {
            return undefined;
        }

        const invalidMediums: string[] = [];
        userColumns.forEach((col) => {
            // Extract the column name if it's a ColumnSortByInfo object, otherwise use as string
            const columnName = typeof col === 'string' ? col : col.name || String(col);
            if (!['Nodes', 'Chunks', ...mediumList].includes(columnName)) {
                invalidMediums.push(columnName);
            }
        });

        if (invalidMediums.length === 0) {
            return undefined;
        }

        return {
            message: i18n('error_some-mediums-not-exist'),
            inner_errors: invalidMediums.map((medium) => ({
                message: i18n('error_medium-not-exist', {medium}),
            })),
        };
    }, [userColumns, mediumList]);

    return (
        <WidgetHeader
            title={name || i18n('title')}
            count={accounts?.length}
            page={'ACCOUNTS'}
            isLoading={isLoading}
            id={props.id}
            error={error}
        />
    );
}
