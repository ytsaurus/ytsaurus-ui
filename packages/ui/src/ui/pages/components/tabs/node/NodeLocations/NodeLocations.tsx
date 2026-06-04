import React from 'react';
import {useSelector} from '../../../../../store/redux-hooks';

import {type Column} from '@gravity-ui/react-data-table';
import {Progress} from '@gravity-ui/uikit';

import format from '../../../../../common/hammer/format';
import {ClipboardButton} from '@ytsaurus/components';
import {DataTableYT} from '../../../../../components/DataTableYT';
import {selectNode} from '../../../../../store/selectors/components/node/node';
import Label from '../../../../../components/Label';
import i18n from './i18n';

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
        get name() {
            return i18n('field_enabled');
        },
        render({row}) {
            return (
                <Label theme={row.enabled ? 'success' : 'danger'}>
                    {row.enabled ? i18n('value_enabled') : i18n('value_disabled')}
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
        get name() {
            return i18n('field_full');
        },
        render({row}) {
            return Boolean(row.full).toString();
        },
        align: 'center',
    },
    {
        get name() {
            return i18n('field_medium-name');
        },
        render({row}) {
            return row.medium_name;
        },
    },
    {
        get name() {
            return i18n('field_sessions');
        },
        render({row}) {
            return format.Number(row.session_count);
        },
        align: 'right',
    },
    {
        get name() {
            return i18n('field_chunks');
        },
        render({row}) {
            return format.Number(row.chunk_count);
        },
        align: 'right',
    },
    {
        get name() {
            return i18n('field_used-space');
        },
        render({row}) {
            return !row.locationProgress ? (
                format.NO_VALUE
            ) : (
                <Progress value={row.locationProgress} text={row.locationText} theme="success" />
            );
        },
    },
    {
        get name() {
            return i18n('field_available-space');
        },
        render({row}) {
            return format.Bytes(row.available_space);
        },
        align: 'right',
        width: 200,
    },
    {
        get name() {
            return i18n('field_watermark-space');
        },
        render({row}) {
            return format.Bytes(row.low_watermark_space);
        },
        align: 'right',
        width: 200,
    },
];

function NodeLocations(): ReturnType<React.VFC> {
    const {node} = useSelector(selectNode);

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
