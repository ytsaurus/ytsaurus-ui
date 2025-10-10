import React from 'react';
import {useSelector} from '../../../../../store/redux-hooks';

import type {Column} from '@gravity-ui/react-data-table';
import {Progress} from '@gravity-ui/uikit';

import format from '../../../../../common/hammer/format';
import DataTableYT from '../../../../../components/DataTableYT/DataTableYT';
import {nodeSelector} from '../../../../../store/selectors/components/node/node';
import Label from '../../../../../components/Label/Label';
import ClipboardButton from '../../../../../components/ClipboardButton/ClipboardButton';

interface LocationInfo {
    enabled?: boolean;
    full?: boolean;
    location_uuid?: string;
    medium_name?: string;
    session_count?: number;
    chunk_count?: number;

    locationText?: string;
    locationProgress?: number;

    available_space?: number;
    low_watermark_space?: number;
}

const columns: Array<Column<LocationInfo>> = [
    {
        name: 'Enabled',
        render({row}) {
            return (
                <Label theme={row.enabled ? 'success' : 'danger'}>
                    {row.enabled ? 'Enabled' : 'Disabled'}
                </Label>
            );
        },
    },
    {
        name: 'Uuid',
        render({row}) {
            return (
                <span>
                    {row.location_uuid}
                    &nbsp;
                    <ClipboardButton view="flat-secondary" text={row.location_uuid} size="s" />
                </span>
            );
        },
        align: 'left',
    },
    {
        name: 'Full',
        render({row}) {
            return Boolean(row.full).toString();
        },
        align: 'center',
    },
    {
        name: 'Medium name',
        render({row}) {
            return row.medium_name;
        },
    },
    {
        name: 'Sessions',
        render({row}) {
            return format.Number(row.session_count);
        },
        align: 'right',
    },
    {
        name: 'Chunks',
        render({row}) {
            return format.Number(row.chunk_count);
        },
        align: 'right',
    },
    {
        name: 'Used space',
        render({row}) {
            return !row.locationProgress ? (
                format.NO_VALUE
            ) : (
                <Progress value={row.locationProgress} text={row.locationText} theme="success" />
            );
        },
    },
    {
        name: 'Available space',
        render({row}) {
            return format.Bytes(row.available_space);
        },
        align: 'right',
        width: 200,
    },
    {
        name: 'Watermark space',
        render({row}) {
            return format.Bytes(row.low_watermark_space);
        },
        align: 'right',
        width: 200,
    },
];

function NodeLocations(): ReturnType<React.VFC> {
    const {node} = useSelector(nodeSelector);

    if (!(node && node.locations.length > 0)) {
        return null;
    }

    return (
        <DataTableYT
            columns={columns}
            data={node.locations}
            startIndex={1}
            useThemeYT
            settings={{
                sortable: false,
            }}
        />
    );
}

export default React.memo(NodeLocations);
