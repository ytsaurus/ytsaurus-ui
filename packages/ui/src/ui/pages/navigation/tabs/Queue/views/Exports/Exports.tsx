import React from 'react';
import {useSelector} from 'react-redux';

import {useFetchBatchQuery} from '../../../../../../store/api/yt';
import {makeGetExportsParams} from '../../../../../../store/api/navigation/tabs/queue/queue';
import {getPath} from '../../../../../../store/selectors/navigation';

import Link from '../../../../../../components/Link/Link';
import DataTableYT, {Column} from '../../../../../../components/DataTableYT/DataTableYT';

import hammer from '../../../../../../common/hammer';
import {QueueExport, QueueExportConfig} from '../../../../../../types/navigation/queue/queue';
import {makeNavigationLink} from '../../../../../../utils/app-url';

import {ExportsEdit} from './ExportsEdit/ExportsEdit';

import './Exports.scss';

export type ExportConfigUtility = {
    id: string;
    export_name: string;
};

type ExportConfigColumns = ExportConfigUtility & QueueExportConfig<number>;

const columns: Array<Column<ExportConfigColumns>> = [
    {
        name: 'export_name',
        render: renderValue,
        header: 'Export name',
    },
    {
        name: 'export_directory',
        render: RenderPath,
        header: 'Export directory',
    },
    {
        name: 'export_period',
        render: renderValue,
        header: 'Export period, ms',
    },
    {
        name: 'export_ttl',
        render: renderValue,
        header: 'Export TTL, ms',
    },
    {
        name: 'output_table_name_pattern',
        render: renderValue,
        header: hammer.format['ReadableField']('output_table_name_pattern'),
    },
    {
        name: 'use_upper_bound_for_table_names',
        render: renderValue,
        header: hammer.format['ReadableField']('use_upper_bound_for_table_names'),
    },
    {
        name: '',
        render({row}) {
            return <ExportsEdit prevConfig={row} />;
        },
    },
];

export function Exports() {
    const path = useSelector(getPath);

    const {
        data: config,
        isLoading,
        isFetching,
    } = useFetchBatchQuery<QueueExport<number>>(makeGetExportsParams(path));

    const data: ExportConfigColumns[] = [];

    if (config && config[0].output) {
        for (const obj in config[0].output) {
            if (obj) {
                const newObj: ExportConfigColumns = {
                    ...config[0].output[obj],
                    export_name: obj,
                    id: obj,
                };
                data.push(newObj);
            }
        }
    }

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

function renderValue({value}: {value?: unknown}) {
    return <>{value ? String(value) : hammer.format.NO_VALUE}</>;
}

function RenderPath({value}: {value?: unknown}) {
    return (
        <Link url={makeNavigationLink({path: String(value)})} routed>
            {String(value)}
        </Link>
    );
}
