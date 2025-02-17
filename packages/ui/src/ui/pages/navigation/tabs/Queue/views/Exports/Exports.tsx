import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {requestExportsConfig} from '../../../../../../store/actions/navigation/tabs/queue/exports';
import {
    getExportsConfig,
    getExportsConfigRequestInfo,
} from '../../../../../../store/selectors/navigation/tabs/queue';
import {getPath} from '../../../../../../store/selectors/navigation';
import Link from '../../../../../../components/Link/Link';
import DataTableYT, {Column} from '../../../../../../components/DataTableYT/DataTableYT';

import hammer from '../../../../../../common/hammer';
import {QueueExportConfig} from '../../../../../../types/navigation/queue/queue';
import {makeNavigationLink} from '../../../../../../utils/app-url';

import {ExportsEdit} from './ExportsEdit/ExportsEdit';

import './Exports.scss';

const columns: Array<Column<QueueExportConfig<number>>> = [
    {
        name: 'export_name',
        sortable: false,
        render: renderValue,
    },
    {
        name: 'export_directory',
        sortable: false,
        render: RenderPath,
    },
    {
        name: 'export_period',
        sortable: false,
        render: renderValue,
    },
    {
        name: 'export_ttl',
        sortable: false,
        render: renderValue,
    },
    {
        name: 'output_table_name_pattern',
        sortable: false,
        render: renderValue,
    },
    {
        name: 'use_upper_bound_for_table_names',
        sortable: false,
        render: renderValue,
    },
    {
        name: '',
        sortable: false,
        render() {
            return <ExportsEdit />;
        },
    },
];

export function Exports() {
    const dispatch = useDispatch();

    const config = useSelector(getExportsConfig);
    const {loading, loaded} = useSelector(getExportsConfigRequestInfo);
    const path = useSelector(getPath);

    useEffect(() => {
        dispatch(requestExportsConfig());
    }, [path]);

    return (
        <DataTableYT<QueueExportConfig<number>>
            columns={columns}
            data={Object.values(config || {}) || []}
            loaded={loaded}
            loading={loading}
            useThemeYT
        />
    );
}

function renderValue({value}: {value?: unknown}) {
    return <>{value ? hammer.format['Readable'](String(value)) : hammer.format.NO_VALUE}</>;
}

function RenderPath({value}: {value?: unknown}) {
    return (
        <Link url={makeNavigationLink({path: String(value)})} routed>
            {String(value)}
        </Link>
    );
}
