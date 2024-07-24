import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {RadioButton} from '@gravity-ui/uikit';

import {getFlowViewMode} from '../../../../store/selectors/flow';
import {
    FLOW_VIEW_MODES,
    FlowViewMode,
    setFlowViewMode,
} from '../../../../store/reducers/flow/filters';

import './Flow.scss';

const block = cn('yt-navigation-flow');

const MODE_OPTIONS = FLOW_VIEW_MODES.map((value) => {
    return {value, content: value};
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
            <div>Not implemented</div>
        </div>
    );
}
