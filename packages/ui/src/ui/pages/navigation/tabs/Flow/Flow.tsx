import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {Button, Flex, Link, RadioButton, Text} from '@gravity-ui/uikit';

import Alert from '../../../../components/Alert/Alert';
import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';
import format from '../../../../common/hammer/format';
import Icon from '../../../../components/Icon/Icon';
import MetaTable from '../../../../components/MetaTable/MetaTable';
import StatusLabel from '../../../../components/StatusLabel/StatusLabel';
import {useUpdater} from '../../../../hooks/use-updater';
import {useThunkDispatch} from '../../../../store/thunkDispatch';
import {loadFlowStatus, updateFlowState} from '../../../../store/actions/flow/status';
import {getFlowViewMode} from '../../../../store/selectors/flow/filters';
import {getFlowStatusData} from '../../../../store/selectors/flow/status';
import {getCluster} from '../../../../store/selectors/global';
import {getAttributes, getPath} from '../../../../store/selectors/navigation';
import {
    FLOW_VIEW_MODES,
    FlowViewMode,
    setFlowViewMode,
} from '../../../../store/reducers/flow/filters';
import UIFactory from '../../../../UIFactory';
import {formatByParams} from '../../../../utils/format';

import {FlowLayout} from './FlowLayout/FlowLayout';
import {FlowDynamicSpec, FlowStaticSpec} from './PipelineSpec/PipelineSpec';
import './Flow.scss';

const block = cn('yt-navigation-flow');

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
                <RadioButton<FlowViewMode>
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
    const path = useSelector(getPath);

    if (!path) {
        return null;
    }

    switch (viewMode) {
        case 'static_spec':
            return <FlowStaticSpec pipeline_path={path} />;
        case 'dynamic_spec':
            return <FlowDynamicSpec pipeline_path={path} />;
        case 'monitoring':
            return <FlowMonitoring />;
        case 'workers':
        case 'computations':
            return <FlowLayout path={path} viewMode={viewMode} />;
        case 'graph':
            return (
                <Alert
                    header={'Warning'}
                    message={`'${viewMode}' view mode is not implemented yet`}
                />
            );
        default:
            return (
                <Alert
                    header="Unexpected behaviour"
                    error={new Error(`'${viewMode}' view mode is not implemented`)}
                />
            );
    }
}

function FlowStatusToolbar() {
    const dispatch = useThunkDispatch();

    const pipeline_path = useSelector(getPath);

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
    const value = useSelector(getFlowStatusData);
    const {leader_controller_address} = useSelector(getAttributes);
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

function FlowMonitoring() {
    const {
        component: Component,
        title,
        urlTemplate,
    } = UIFactory.getMonitoringComponentForNavigationFlow() ?? {};
    const attributes = useSelector(getAttributes);
    const {monitoring_cluster, monitoring_project} = attributes;
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
