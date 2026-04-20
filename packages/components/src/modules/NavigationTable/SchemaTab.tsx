import {FC, useMemo} from 'react';
import {Flex, Text as GravityText, Icon, TextInput} from '@gravity-ui/uikit';
import BarsAscendingAlignLeftArrowUpIcon from '@gravity-ui/icons/svgs/bars-ascending-align-left-arrow-up.svg';
import BarsAscendingAlignLeftArrowDownIcon from '@gravity-ui/icons/svgs/bars-ascending-align-left-arrow-down.svg';
import type {NavigationTableSchema} from '../../types';
import {Column} from '@gravity-ui/react-data-table';
import unipika from '../../utils/unipika';
import {DataTableYT} from '../../components';
import {YSON_DEFAULT_UNIPIKA_SETTINGS, Yson} from '../../internal/Yson';
import type {UnipikaSettings} from '../../internal/Yson/StructuredYson/StructuredYsonTypes';
import i18n from './i18n';

type SchemaTabProps = {
    schema: NavigationTableSchema[];
    filter: string;
    onFilterChange: (value: string) => void;
    ysonSettings?: UnipikaSettings;
};

export const SchemaTab: FC<SchemaTabProps> = ({schema, filter, onFilterChange, ysonSettings}) => {
    const cellUnipikaSettings = ysonSettings ?? YSON_DEFAULT_UNIPIKA_SETTINGS;

    const columns: Column<NavigationTableSchema>[] = useMemo(
        () => [
            {
                name: 'name',
                header: 'Name',
                render: ({row}) => {
                    return (
                        <Flex alignItems="center" gap={1}>
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
                            <Yson
                                value={unipika.unescapeKeyValue(row.name)}
                                settings={{...cellUnipikaSettings, asHTML: false}}
                                inline
                            />
                        </Flex>
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
        [cellUnipikaSettings],
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
