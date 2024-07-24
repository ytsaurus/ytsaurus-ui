import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {RadioButton} from '@gravity-ui/uikit';

import format from '../../../../common/hammer/format';
import Alert from '../../../../components/Alert/Alert';
import {getFlowViewMode} from '../../../../store/selectors/flow/filters';
import {
    FLOW_VIEW_MODES,
    FlowViewMode,
    setFlowViewMode,
} from '../../../../store/reducers/flow/filters';

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
            <RadioButton<FlowViewMode>
                className={block('view-mode')}
                options={MODE_OPTIONS}
                value={viewMode}
                onUpdate={(value) => dispatch(setFlowViewMode(value))}
            />
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
