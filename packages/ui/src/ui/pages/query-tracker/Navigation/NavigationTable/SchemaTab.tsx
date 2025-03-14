import React, {FC} from 'react';
import {NavigationTableSchema, setFilter} from '../../module/queryNavigation/queryNavigationSlice';
import DataTableYT from '../../../../components/DataTableYT/DataTableYT';
import {Column} from '@gravity-ui/react-data-table';
import {Text, TextInput} from '@gravity-ui/uikit';
import Icon from '../../../../components/Icon/Icon';
import {useDispatch, useSelector} from 'react-redux';
import {selectNavigationFilter} from '../../module/queryNavigation/selectors';
import unipika from '../../../../common/thor/unipika';

type Props = {
    schema: NavigationTableSchema[];
};

const columns: Column<NavigationTableSchema>[] = [
    {
        name: 'name',
        header: 'Name',
        render: ({row}) => {
            return (
                <>
                    {Boolean(row.sort_order) && (
                        <Icon
                            awesome={
                                row.sort_order === 'descending'
                                    ? 'sort-amount-up'
                                    : 'sort-amount-down-alt'
                            }
                            size={16}
                        />
                    )}{' '}
                    {unipika.prettyprint(row.name, {asHTML: false})}
                </>
            );
        },
    },
    {
        name: 'type',
        header: 'Type v3',
        render: ({row}) => {
            return (
                <>
                    {row.type} {!row.required && <Text variant="caption-1">optional</Text>}
                </>
            );
        },
    },
];

export const SchemaTab: FC<Props> = ({schema}) => {
    const dispatch = useDispatch();
    const filter = useSelector(selectNavigationFilter);

    const handleFilterChange = (value: string) => {
        dispatch(setFilter(value));
    };

    return (
        <>
            <TextInput
                value={filter}
                placeholder="Filter by name"
                onUpdate={handleFilterChange}
                hasClear
            />
            <DataTableYT data={schema} columns={columns} useThemeYT />
        </>
    );
};
