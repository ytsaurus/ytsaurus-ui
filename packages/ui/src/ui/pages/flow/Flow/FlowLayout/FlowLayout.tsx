import React from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import {Column} from '@gravity-ui/react-data-table';

import format from '../../../../common/hammer/format';

import ClickableAttributesButton from '../../../../components/AttributesButton/ClickableAttributesButton';
import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';
import DataTableYT, {
    DATA_TABLE_YT_SETTINGS,
} from '../../../../components/DataTableYT/DataTableYT';
import {YTErrorBlock} from '../../../../components/Error/Error';
import {ExpandButton} from '../../../../components/ExpandButton';

import {useUpdater} from '../../../../hooks/use-updater';
import {
    expandFlowLayoutComputation,
    expandFlowLayoutWorker,
    loadFlowLayout,
} from '../../../../store/actions/flow/layout';
import {
    FlowLayoutDataItem,
    getFlowLayoutData,
    getFlowLayoutError,
    getFlowLayoutPipelinePath,
} from '../../../../store/selectors/flow/layout';

import './FlowLayout.scss';

const block = cn('yt-flow-layout');

export function FlowLayout({path, viewMode}: {path: string; viewMode: 'computations' | 'workers'}) {
    const dispatch = useDispatch();

    const pipeline_path = useSelector(getFlowLayoutPipelinePath);
    const error = useSelector(getFlowLayoutError);
    const getData = useSelector(getFlowLayoutData);

    const data = React.useMemo(() => {
        return getData(viewMode);
    }, [viewMode, getData]);

    const samePath = path === pipeline_path;
    const columns = useFlowLayoutColumn(viewMode);

    const updateFn = React.useCallback(() => {
        dispatch(loadFlowLayout(path));
    }, [path, dispatch]);
    useUpdater(updateFn);

    if (!samePath) {
        return null;
    }

    return (
        <div className={block()}>
            {Boolean(error) && <YTErrorBlock error={error!} />}
            <DataTableYT
                settings={DATA_TABLE_YT_SETTINGS}
                columns={columns}
                data={data}
                useThemeYT
            />
        </div>
    );
}

function useFlowLayoutColumn(type: 'computations' | 'workers') {
    const dispatch = useDispatch();

    const res = React.useMemo(() => {
        const isComputations = type === 'computations';
        const columns: Array<Column<FlowLayoutDataItem>> = [
            {
                name: isComputations
                    ? 'Computation / Partition Id'
                    : 'Worker address / Partition Id',
                className: block('td-name'),
                render({row}) {
                    let content;
                    if ('$attributes' in row) {
                        const {
                            $attributes: {name, expanded},
                        } = row;
                        content = (
                            <>
                                <ExpandButton
                                    className={block('expand', {hidden: row.$value.length === 0})}
                                    expanded={expanded}
                                    toggleExpanded={() => {
                                        dispatch(
                                            isComputations
                                                ? expandFlowLayoutComputation({
                                                      computation_id: name,
                                                  })
                                                : expandFlowLayoutWorker({worker_address: name}),
                                        );
                                        requestAnimationFrame(() => {
                                            window.dispatchEvent(new Event('resize'));
                                        });
                                    }}
                                />
                                <span className={block('name-title')}>
                                    {name}{' '}
                                    <ClipboardButton
                                        view="flat-secondary"
                                        text={name}
                                        inlineMargins
                                        visibleOnRowHover
                                    />
                                </span>
                            </>
                        );
                    } else {
                        content = (
                            <span className={block('name-title', {level: '1'})}>
                                {row.partition?.partition_id}
                                <ClipboardButton
                                    view="flat-secondary"
                                    text={row.partition?.partition_id}
                                    inlineMargins
                                    visibleOnRowHover
                                />
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
                        ? row.partition?.state
                        : format.Number(row.$value.length);
                },
                width: 120,
            },
            {
                name: 'Job Id',
                render({row}) {
                    return 'partition' in row ? (
                        <>
                            {row.partition?.current_job_id}{' '}
                            <ClipboardButton
                                view="flat-secondary"
                                text={row.partition?.current_job_id}
                                inlineMargins
                                visibleOnRowHover
                            />
                        </>
                    ) : (
                        format.Number(row.$attributes.job_count)
                    );
                },
                width: 400,
            },
            isComputations
                ? {
                      name: 'Worker address',
                      render({row}) {
                          return 'job' in row ? (
                              <>
                                  {row.job?.worker_address}
                                  <ClipboardButton
                                      view="flat-secondary"
                                      text={row.job?.worker_address}
                                      inlineMargins
                                      visibleOnRowHover
                                  />
                              </>
                          ) : (
                              format.Number(row.$attributes.worker_count)
                          );
                      },
                      width: 400,
                  }
                : {
                      name: 'Computation',
                      render({row}) {
                          return 'partition' in row
                              ? row.partition?.computation_id
                              : format.Number(row.$attributes.partition_count);
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
    }, [type]);
    return res;
}
