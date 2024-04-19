import {QueryResultColumn} from '../../module/query_result/types';
import React, {useCallback, useMemo} from 'react';
import {Button, Icon, Text} from '@gravity-ui/uikit';
import filterIcon from '../../../../assets/img/svg/icons/filter.svg';
import {ColumnSelector} from '../../../../components/common/ColumnSelector/ColumnSelector';
type Props = {
    allColumns: QueryResultColumn[];
    columns?: string[];
    className?: string;
    onChange: (columns: string[]) => void;
};

export const TableColumnsSelector = React.memo(function TableColumnsSelector({
    allColumns,
    columns,
    className,
    onChange,
}: Props) {
    const handleChange = useCallback(
        (items: string[]) => {
            onChange(items);
        },
        [onChange],
    );

    const value = useMemo(() => {
        if (columns) {
            return columns;
        }
        return allColumns.map((i) => i.name);
    }, [allColumns, columns]);

    const showAllColumns = !columns || value.length === columns?.length;
    const view = showAllColumns ? 'normal' : 'action';

    return (
        <>
            <ColumnSelector<QueryResultColumn>
                className={className}
                renderItemValue={(item) => item.displayName}
                getItemId={(item) => item.name}
                value={value}
                items={allColumns}
                switcher={
                    <Button size="m" title="Choose result columns" view={view}>
                        <Icon data={filterIcon} />
                        Columns&nbsp;
                        <Text color="secondary">{value?.length + '/' + allColumns.length}</Text>
                    </Button>
                }
                onUpdate={handleChange}
            />
        </>
    );
});
