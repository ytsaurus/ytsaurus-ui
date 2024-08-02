import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {Column} from '@gravity-ui/react-data-table';

import format from '../../../../../common/hammer/format';

import ClickableAttributesButton from '../../../../../components/AttributesButton/ClickableAttributesButton';
import DataTableYT, {
    DATA_TABLE_YT_SETTINGS,
} from '../../../../../components/DataTableYT/DataTableYT';
import ErrorBlock from '../../../../../components/Error/Error';
import {ExpandButton} from '../../../../../components/ExpandButton';

import {useUpdater} from '../../../../../hooks/use-updater';
import {
    expandFlowLayoutComputation,
    loadFlowLayout,
} from '../../../../../store/actions/flow/layout';
import {
    FlowLayoutDataItem,
    getFlowLayoutData,
    getFlowLayoutError,
    getFlowLayoutPipelinePath,
} from '../../../../../store/selectors/flow/layout';

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

function useFlowLayoutColumn() {
    const dispatch = useDispatch();

    const res = React.useMemo(() => {
        const columns: Array<Column<FlowLayoutDataItem>> = [
            {
                name: 'Computation Id / Partition Id',
                className: block('td-name'),
                render({row}) {
                    let content;
                    if ('$attributes' in row) {
                        const {
                            $attributes: {computation_id, expanded},
                        } = row;
                        content = (
                            <>
                                <ExpandButton
                                    expanded={expanded}
                                    toggleExpanded={() => {
                                        dispatch(expandFlowLayoutComputation({computation_id}));
                                        requestAnimationFrame(() => {
                                            window.dispatchEvent(new Event('resize'));
                                        });
                                    }}
                                />
                                <span className={block('name-title')}>{computation_id}</span>
                            </>
                        );
                    } else {
                        content = (
                            <span className={block('name-title', {level: '1'})}>
                                {row.partition.partition_id}
                            </span>
                        );
                    }
                    return <div className={block('name')}>{content}</div>;
                },
            },
            {
                name: 'Partition state',
                render({row}) {
                    return 'partition' in row
                        ? row.partition.state
                        : format.Number(row.$value.length);
                },
                width: 120,
            },
            {
                name: 'Job',
                render({row}) {
                    return 'partition' in row
                        ? row.partition.current_job_id
                        : format.Number(row.$attributes.job_count);
                },
                width: 400,
            },
            {
                name: 'Worker address',
                render({row}) {
                    return 'job' in row
                        ? row.job?.worker_address
                        : format.Number(row.$attributes.worker_count);
                },
                width: 400,
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
                width: 50,
            },
        ];
        return columns;
    }, []);
    return res;
}
