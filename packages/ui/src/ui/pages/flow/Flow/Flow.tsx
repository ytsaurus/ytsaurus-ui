import cn from 'bem-cn-lite';
import React from 'react';

import {Button, Flex, Link, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';
import {formatByParams} from '../../../../../shared/utils/format';
import format from '../../../../common/hammer/format';
import {YTAlertBlock} from '../../../../components/Alert/Alert';
import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';
import Icon from '../../../../components/Icon/Icon';
import MetaTable from '../../../../components/MetaTable/MetaTable';
import StatusLabel from '../../../../components/StatusLabel/StatusLabel';
import {useUpdater} from '../../../../hooks/use-updater';
import {YTApiId} from '../../../../shared/constants/yt-api-id';
import {loadFlowStatus, updateFlowState} from '../../../../store/actions/flow/status';
import {
    FLOW_VIEW_MODES,
    FlowViewMode,
    setFlowViewMode,
} from '../../../../store/reducers/flow/filters';
import {getFlowViewMode} from '../../../../store/selectors/flow/filters';
import {getFlowStatusData} from '../../../../store/selectors/flow/status';
import {getCluster} from '../../../../store/selectors/global';
import UIFactory from '../../../../UIFactory';
import {useGetQuery} from '../../../store/api/yt/get';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {getPipelinePath} from '../../../store/selectors/flow/filters';
import './Flow.scss';
import {FlowGraph} from './FlowGraph/FlowGraph';
import {FlowLayout} from './FlowLayout/FlowLayout';
import {FlowDynamicSpec, FlowStaticSpec} from './PipelineSpec/PipelineSpec';

const block = cn('yt-flow');

function useViewModeOptions() {
    const res = React.useMemo(() => {
        const {urlTemplate, component} = UIFactory.getMonitoringComponentForNavigationFlow() ?? {};
        const options =
            component || urlTemplate
                ? FLOW_VIEW_MODES
                : FLOW_VIEW_MODES.filter((item) => item !== 'monitoring');

        return options.map((value) => {
            return {value, content: format.ReadableField(value)};
        });
    }, []);
    return res;
}

export function Flow() {
    const dispatch = useDispatch();
    const viewMode = useSelector(getFlowViewMode);

    const options = useViewModeOptions();

    return (
        <div className={block()}>
            <FlowState />
            <Flex className={block('toolbar')}>
                <SegmentedRadioGroup<FlowViewMode>
                    options={options}
                    value={viewMode}
                    onUpdate={(value) => dispatch(setFlowViewMode(value))}
                />
            </Flex>
            <div className={block('content', {view: viewMode})}>
                <FlowContent viewMode={viewMode} />
            </div>
        </div>
    );
}

function FlowContent({viewMode}: {viewMode: FlowViewMode}) {
    const path = useSelector(getPipelinePath);

    if (!path) {
        return null;
    }

    switch (viewMode) {
        case 'static_spec':
            return <FlowStaticSpec pipeline_path={path} />;
        case 'dynamic_spec':
            return <FlowDynamicSpec pipeline_path={path} />;
        case 'monitoring':
            return <FlowMonitoring pipeline_path={path} />;
        case 'workers':
        case 'computations':
            return <FlowLayout path={path} viewMode={viewMode} />;
        case 'graph':
        case 'graph_data':
            return <FlowGraph pipeline_path={path} yson={viewMode === 'graph_data'} />;

        default:
            return (
                <YTAlertBlock
                    header="Unexpected behaviour"
                    error={new Error(`'${viewMode}' view mode is not implemented`)}
                />
            );
    }
}

function FlowStatusToolbar() {
    const dispatch = useDispatch();

    const pipeline_path = useSelector(getPipelinePath);

    const updateFn = React.useCallback(() => {
        return dispatch(loadFlowStatus(pipeline_path));
    }, [pipeline_path, dispatch]);

    useUpdater(updateFn);

    const {onStart, onStop, onPause} = React.useMemo(() => {
        return {
            onStart: () => dispatch(updateFlowState({pipeline_path, state: 'start'})),
            onStop: () => dispatch(updateFlowState({pipeline_path, state: 'stop'})),
            onPause: () => dispatch(updateFlowState({pipeline_path, state: 'pause'})),
        };
    }, [dispatch, pipeline_path]);

    return (
        <Flex className={block('status-toolbar')} alignItems="center" gap={2}>
            <Button view="outlined" onClick={onStart}>
                <Icon awesome="play-circle" /> Start
            </Button>
            <Button view="outlined" onClick={onPause}>
                <Icon awesome="pause-circle" /> Pause
            </Button>
            <Button view="outlined" onClick={onStop}>
                <Icon awesome="stop-circle" /> Stop
            </Button>
        </Flex>
    );
}

function FlowState() {
    const pipeline_path = useSelector(getPipelinePath);
    const value = useSelector(getFlowStatusData);
    const {leader_controller_address} = useFlowAttributes(pipeline_path).data ?? {};
    return (
        <React.Fragment>
            <Flex className={block('state')} alignItems="center" gap={2}>
                <Text variant="header-1">Processing catalog </Text>
                <FlowStatusToolbar />
            </Flex>
            <MetaTable
                items={[
                    [{key: 'status', value: <StatusLabel label={value} />}],
                    [
                        {
                            key: 'leader_controller_address',
                            value: (
                                <>
                                    {leader_controller_address}
                                    <ClipboardButton
                                        view="flat-secondary"
                                        text={leader_controller_address}
                                        inlineMargins
                                    />
                                </>
                            ),
                            className: block('meta-item'),
                        },
                    ],
                ]}
            />
        </React.Fragment>
    );
}

type FlowAttributes = {
    monitoring_cluster: string;
    monitoring_project: string;
    leader_controller_address: string;
};

function useFlowAttributes(path: string) {
    return useGetQuery<Partial<FlowAttributes>>({
        id: YTApiId.flowAttributes,
        parameters: {
            path: `${path}/@`,
            attributes: ['monitoring_cluster', 'monitoring_project', 'leader_controller_address'],
        },
    });
}

function FlowMonitoring({pipeline_path}: {pipeline_path: string}) {
    const {
        component: Component,
        title,
        urlTemplate,
    } = UIFactory.getMonitoringComponentForNavigationFlow() ?? {};
    const attributes = useFlowAttributes(pipeline_path).data;
    const {monitoring_cluster, monitoring_project} = attributes ?? {};
    const cluster = useSelector(getCluster);

    if (Component) {
        return (
            <Component
                cluster={cluster}
                monitoring_cluster={monitoring_cluster}
                monitoring_project={monitoring_project}
                attributes={attributes}
            />
        );
    } else if (urlTemplate) {
        return (
            <Link
                target="_blank"
                href={formatByParams(urlTemplate, {
                    ytCluster: cluster,
                    monitoring_cluster,
                    monitoring_project,
                })}
            >
                {title || 'Monitoring'}
            </Link>
        );
    } else {
        return null;
    }
}
