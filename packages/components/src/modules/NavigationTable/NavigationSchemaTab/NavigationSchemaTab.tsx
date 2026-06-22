import {FC, useMemo} from 'react';
import {TextInput} from '@gravity-ui/uikit';
import type {NavigationTableSchema} from '../../../types';
import {Column} from '@gravity-ui/react-data-table';
import {DataTableYT} from '../../../components';
import {YSON_DEFAULT_UNIPIKA_SETTINGS} from '../../../internal/Yson';
import type {UnipikaSettings} from '../../../internal/Yson/StructuredYson/StructuredYsonTypes';
import i18n from './i18n';
import {filterSchema} from '../helpers/filterSchema';
import {makeNavigationColumns} from './makeNavigationColumns';

type SchemaTabProps = {
    schema: NavigationTableSchema[];
    filter?: string;
    onFilterChange?: (value: string) => void;
    ysonSettings?: UnipikaSettings;
};

export const NavigationSchemaTab: FC<SchemaTabProps> = ({
    schema,
    filter,
    onFilterChange,
    ysonSettings = YSON_DEFAULT_UNIPIKA_SETTINGS,
}) => {
    const filteredSchema = filterSchema(schema, filter);
    const columns: Column<NavigationTableSchema>[] = useMemo(
        () => makeNavigationColumns(ysonSettings),
        [ysonSettings],
    );

    return (
        <>
            <TextInput
                value={filter}
                placeholder={i18n('field_filter-by-name')}
                onUpdate={onFilterChange}
                hasClear
            />
            <DataTableYT key={filter} data={filteredSchema} columns={columns} useThemeYT />
        </>
    );
};
