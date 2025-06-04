import React from 'react';
import {ClipboardButton, Flex, Text} from '@gravity-ui/uikit';

import Link from '../../../../../../components/Link/Link';
import Icon from '../../../../../../components/Icon/Icon';
import DataTableYT, {Column} from '../../../../../../components/DataTableYT/DataTableYT';
import {Tooltip} from '../../../../../../components/Tooltip/Tooltip';
import {formatTimeDuration} from '../../../../../../components/TimeDuration/TimeDuration';

import hammer from '../../../../../../common/hammer';
import {QueueExportConfig} from '../../../../../../types/navigation/queue/queue';
import {makeNavigationLink} from '../../../../../../utils/app-url';

import {ExportsEdit} from './ExportsEdit/ExportsEdit';
import {useExports} from './use-exports';

export type ExportConfigUtility = {
    id: string;
    export_name: string;
};

export type ExportConfigColumns = ExportConfigUtility & QueueExportConfig<number>;

const columns: Array<Column<ExportConfigColumns>> = [
    {
        name: 'export_name',
        render: Value,
        header: 'Export name',
    },
    {
        name: 'export_directory',
        render: Path,
        header: 'Export directory',
    },
    {
        name: 'export_period',
        render: Time,
        header: 'Export period',
    },
    {
        name: 'export_ttl',
        render: Time,
        header: 'Export TTL',
    },
    {
        name: 'output_table_name_pattern',
        render: Value,
        header: 'Output table name pattern',
    },
    {
        name: 'use_upper_bound_for_table_names',
        render: Value,
        header: 'Use upper bound for table names',
    },
    {
        name: '',
        render({row}) {
            return <ExportsEdit prevConfig={row} />;
        },
    },
];

export function Exports() {
    const {data, isLoading, isFetching} = useExports();

    return (
        <DataTableYT<ExportConfigColumns>
            columns={columns}
            data={data}
            loaded={!isFetching}
            loading={isLoading}
            useThemeYT
            settings={{displayIndices: false, sortable: false}}
        />
    );
}

function Value({value}: {value?: unknown}) {
    return <>{value ? String(value) : hammer.format.NO_VALUE}</>;
}

function Time({value}: {value?: unknown}) {
    return (
        <Flex alignItems={'center'} gap={1}>
            <Text>{value ? formatTimeDuration(Number(value)) : hammer.format.NO_VALUE}</Text>
            {Boolean(value) && (
                <Tooltip
                    content={
                        <Flex gap={2} alignItems={'center'}>
                            <ClipboardButton text={String(value)} />
                            {String(value)}, ms
                        </Flex>
                    }
                >
                    <Icon awesome={'question-circle'} />
                </Tooltip>
            )}
        </Flex>
    );
}

function Path({value}: {value?: unknown}) {
    return (
        <Link url={makeNavigationLink({path: String(value)})} routed>
            {String(value)}
        </Link>
    );
}
