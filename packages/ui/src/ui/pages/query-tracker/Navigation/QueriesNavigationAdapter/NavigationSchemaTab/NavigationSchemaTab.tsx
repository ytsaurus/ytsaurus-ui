import React, {useMemo} from 'react';
import {type NavigationDetailTabRenderContext, NavigationSchema} from '@gravity-ui/querieskit';
import {type ExternalSchemaColumn} from '@ytsaurus/components/modules';
import {type Column} from '@gravity-ui/react-data-table';

import {useSelector} from '../../../../../store/redux-hooks';
import {selectNavigationTable} from '../../../../../store/selectors/query-tracker/queryNavigation';
import {selectYsonSettingsDisableDecode} from '../../../../../store/selectors/thor/unipika';
import unipika from '../../../../../common/thor/unipika';
import {prettyPrintSafe} from '../../../../../utils/unipika';
import {prepareNavigationSchema} from '../adapters';

type SchemaRow = ReturnType<typeof prepareNavigationSchema>[number] & {sourceName: string};

type Props = Pick<
    NavigationDetailTabRenderContext,
    'search' | 'onSearchUpdate' | 'searchPlaceholder'
> & {
    extraColumns?: ExternalSchemaColumn[];
};

export function NavigationSchemaTab({
    extraColumns,
    search,
    onSearchUpdate,
    searchPlaceholder,
}: Props) {
    const table = useSelector(selectNavigationTable);
    const ysonSettings = useSelector(selectYsonSettingsDisableDecode);
    const schema = useMemo<SchemaRow[]>(
        () =>
            prepareNavigationSchema(table?.schema ?? []).map((column) => ({
                ...column,
                sourceName: column.name,
                name: prettyPrintSafe(unipika.unescapeKeyValue(column.name), {
                    ...ysonSettings,
                    asHTML: false,
                    indent: 0,
                    break: false,
                }),
            })),
        [table?.schema, ysonSettings],
    );
    const schemaExtraColumns = useMemo<Column<SchemaRow>[] | undefined>(
        () =>
            extraColumns?.map((column) => {
                const render = column.render;
                return {
                    name: column.name,
                    header: column.header,
                    sortable: column.sortable,
                    render: render
                        ? (context) =>
                              render({
                                  ...context,
                                  row: {...context.row, name: context.row.sourceName},
                              })
                        : undefined,
                };
            }),
        [extraColumns],
    );

    return (
        <NavigationSchema
            key={extraColumns?.map(({name}) => name).join('/') ?? 'base'}
            data={{columns: schema}}
            view={{extraColumns: schemaExtraColumns}}
            search={search}
            onSearchUpdate={onSearchUpdate}
            searchPlaceholder={searchPlaceholder}
            defaultVisibleColumns={[
                'name',
                'type',
                'required',
                ...(extraColumns?.map(({name}) => name) ?? []),
            ]}
        />
    );
}
