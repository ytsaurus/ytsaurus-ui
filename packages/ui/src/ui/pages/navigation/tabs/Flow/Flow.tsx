import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {Button, Flex, Label, LabelProps, RadioButton, Text} from '@gravity-ui/uikit';

import format from '../../../../common/hammer/format';
import Alert from '../../../../components/Alert/Alert';
import Icon from '../../../../components/Icon/Icon';
import {useUpdater} from '../../../../hooks/use-updater';
import {useThunkDispatch} from '../../../../store/thunkDispatch';
import {getFlowViewMode} from '../../../../store/selectors/flow/filters';
import {getFlowStatusData} from '../../../../store/selectors/flow/status';
import {loadFlowStatus, updateFlowState} from '../../../../store/actions/flow/status';
import {getPath} from '../../../../store/selectors/navigation';
import {
    FLOW_VIEW_MODES,
    FlowViewMode,
    setFlowViewMode,
} from '../../../../store/reducers/flow/filters';
import {FlowStatus} from '../../../../store/reducers/flow/status';

import {FlowStaticSpec} from './PipelineSpec/PipelineSpec';
import './Flow.scss';

const block = cn('yt-navigation-flow');

const MODE_OPTIONS = FLOW_VIEW_MODES.map((value) => {
    return {value, content: format.ReadableField(value)};
});

export function Flow() {
    const dispatch = useDispatch();
    const viewMode = useSelector(getFlowViewMode);
    return (
        <div className={block()}>
            <Flex className={block('toolbar')}>
                <RadioButton<FlowViewMode>
                    options={MODE_OPTIONS}
                    value={viewMode}
                    onUpdate={(value) => dispatch(setFlowViewMode(value))}
                />
                <FlowStatusToolbar />
            </Flex>
            <FlowState />
            <div className={block('content', {view: viewMode})}>
                <FlowContent viewMode={viewMode} />
            </div>
        </div>
    );
}

function FlowContent({viewMode}: {viewMode: FlowViewMode}) {
    switch (viewMode) {
        case 'static_spec':
            return <FlowStaticSpec />;
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

    const path = useSelector(getPath);

    const updateFn = React.useCallback(() => {
        return dispatch(loadFlowStatus(path));
    }, [path, dispatch]);

    useUpdater(updateFn);

    const {onStart, onStop, onPause} = React.useMemo(() => {
        return {
            onStart: () => dispatch(updateFlowState({pipeline_path: path, state: 'start'})),
            onStop: () => dispatch(updateFlowState({pipeline_path: path, state: 'stop'})),
            onPause: () => dispatch(updateFlowState({pipeline_path: path, state: 'pause'})),
        };
    }, [dispatch, path]);

    return (
        <Flex className={block('status-toolbar')} alignItems="center" gap={3}>
            <Button view="outlined" onClick={onStart}>
                <Icon awesome="play-circle" />
            </Button>
            <Button view="outlined" onClick={onPause}>
                <Icon awesome="pause-circle" />
            </Button>
            <Button view="outlined" onClick={onStop}>
                <Icon awesome="stop-circle" />
            </Button>
        </Flex>
    );
}

const STATE_TO_THEME: Partial<Record<FlowStatus, LabelProps['theme']>> = {
    Completed: 'success',
    Working: 'info',
    Pausing: 'info',
    Stopped: 'danger',
};

function FlowState() {
    const value = useSelector(getFlowStatusData);
    return (
        <Flex className={block('state')} alignItems="center" gap={1}>
            <Text variant="header-1">Processing catalog: </Text>
            <Label size="m" theme={STATE_TO_THEME[value!]}>
                <Text variant="code-3">{value}</Text>
            </Label>
        </Flex>
    );
}
