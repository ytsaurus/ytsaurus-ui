import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import ClickableAttributesButton from '../../../../../components/AttributesButton/ClickableAttributesButton';
import DataTableYT, {
    DATA_TABLE_YT_SETTINGS,
} from '../../../../../components/DataTableYT/DataTableYT';
import ErrorBlock from '../../../../../components/Error/Error';

import {useUpdater} from '../../../../../hooks/use-updater';
import {loadFlowLayout} from '../../../../../store/actions/flow/layout';
import {
    getFlowLayoutData,
    getFlowLayoutError,
    getFlowLayoutPipelinePath,
} from '../../../../../store/selectors/flow/layout';
import {Column} from '@gravity-ui/react-data-table';

import './FlowLayout.scss';

const block = cn('yt-navigation-flow-layout');

export function FlowLayout({path}: {path: string}) {
    const dispatch = useDispatch();

    const pipeline_path = useSelector(getFlowLayoutPipelinePath);
    const error = useSelector(getFlowLayoutError);
    const data = useSelector(getFlowLayoutData);

    const samePath = path === pipeline_path;
    const columns = useFlowLayoutColumn();

    const updateFn = React.useCallback(() => {
        dispatch(loadFlowLayout(path));
    }, [path, dispatch]);
    useUpdater(updateFn);

    if (!samePath) {
        return null;
    }

    return (
        <div className={block()}>
            {Boolean(error) && <ErrorBlock error={error} />}
            <DataTableYT
                settings={DATA_TABLE_YT_SETTINGS}
                columns={columns}
                data={data}
                useThemeYT
            />
        </div>
    );
}

type RowData = ReturnType<typeof getFlowLayoutData>[number];

function useFlowLayoutColumn() {
    const res = React.useMemo(() => {
        const columns: Array<Column<RowData>> = [
            {
                name: 'Computation Id',
                render: ({row}) => {
                    return row.partition.computation_id;
                },
            },
            {
                name: 'Partition',
                render({row}) {
                    return row.partition.partition_id;
                },
            },
            {
                name: 'Partition state',
                render({row}) {
                    return row.partition.state;
                },
            },
            {
                name: 'Job',
                render({row}) {
                    return row.partition.current_job_id;
                },
            },
            {
                name: 'Worker address',
                render({row}) {
                    return row.job?.worker_address;
                },
            },
            {
                name: 'actions',
                header: null,
                render({row}) {
                    return (
                        <ClickableAttributesButton
                            className={block('show-attributes')}
                            title={'Details'}
                            attributes={row}
                            withTooltip={false}
                        />
                    );
                },
            },
        ];
        return columns;
    }, []);
    return res;
}
