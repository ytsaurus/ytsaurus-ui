import {FC, useMemo} from 'react';
import {Text as GravityText, Icon, TextInput} from '@gravity-ui/uikit';
import BarsAscendingAlignLeftArrowUpIcon from '@gravity-ui/icons/svgs/bars-ascending-align-left-arrow-up.svg';
import BarsAscendingAlignLeftArrowDownIcon from '@gravity-ui/icons/svgs/bars-ascending-align-left-arrow-down.svg';
import type {NavigationTableSchema} from '../../types';
import {Column} from '@gravity-ui/react-data-table';
import unipika from '../../utils/unipika';
import {DataTableYT} from '../../components';
import {useUnipikaSettings} from '../../context';
import i18n from './i18n';

type SchemaTabProps = {
    schema: NavigationTableSchema[];
    filter: string;
    onFilterChange: (value: string) => void;
};

export const SchemaTab: FC<SchemaTabProps> = ({schema, filter, onFilterChange}) => {
    const unipikaSettings = useUnipikaSettings();

    const columns: Column<NavigationTableSchema>[] = useMemo(
        () => [
            {
                name: 'name',
                header: 'Name',
                render: ({row}) => {
                    return (
                        <>
                            {Boolean(row.sort_order) && (
                                <Icon
                                    data={
                                        row.sort_order === 'descending'
                                            ? BarsAscendingAlignLeftArrowUpIcon
                                            : BarsAscendingAlignLeftArrowDownIcon
                                    }
                                    size={16}
                                />
                            )}{' '}
                            {unipika.prettyprint(row.name, {...unipikaSettings, asHTML: false})}
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
                            {row.type}{' '}
                            {!row.required && (
                                <GravityText variant="caption-1">optional</GravityText>
                            )}
                        </>
                    );
                },
            },
        ],
        [unipikaSettings],
    );

    return (
        <>
            <TextInput
                value={filter}
                placeholder={i18n('field_filter-by-name')}
                onUpdate={onFilterChange}
                hasClear
            />
            <DataTableYT data={schema} columns={columns} useThemeYT />
        </>
    );
};
