import React from 'react';
import b from 'bem-cn-lite';

import StatusLabel, {
    StatusLabelState,
} from '../../../../../../../components/StatusLabel/StatusLabel';
import {Flex, Progress} from '@gravity-ui/uikit';

import './State.scss';

const block = b('progress');

type Props = {
    progress: {
        state: StatusLabelState;
        progress: any;
    };
};

const PREPARING_STATES = ['materializing', 'initializing', 'preparing', 'pending'];

const RUNNING_STATES = ['running', 'completing', 'failing', 'aborting', 'reviving'];

export function State({progress: {state, progress}}: Props) {
    const RESOLVED_PROGRESS = 100;
    const PENDING_PROGRESS = 0;

    const intermidiateStates = [...PREPARING_STATES, ...RUNNING_STATES];

    let progressBar;

    switch (state) {
        case 'running':
            progressBar = intermidiateStates.includes(state) && (
                <Progress
                    size="s"
                    value={progress.jobsProgress || 0}
                    className={block('bar')}
                    stack={[
                        {
                            value: progress.completedProgress || 0,
                            theme: 'success',
                        },
                        {value: progress.runningProgress || 0, theme: 'info'},
                    ]}
                />
            );
            break;
        case 'completed':
            progressBar = (
                <Progress
                    size="s"
                    value={RESOLVED_PROGRESS}
                    theme="success"
                    className={block('bar')}
                />
            );
            break;
        case 'failed':
            progressBar = (
                <Progress
                    size="s"
                    value={RESOLVED_PROGRESS}
                    theme="danger"
                    className={block('bar')}
                />
            );
            break;
        case 'aborted':
            progressBar = (
                <Progress
                    size="s"
                    value={RESOLVED_PROGRESS}
                    theme="default"
                    className={block('bar')}
                />
            );
            break;
        default:
            progressBar = (
                <Progress size="s" value={PENDING_PROGRESS || 0} className={block('bar')} />
            );
            break;
    }

    return (
        <Flex direction={'column'} gap={1}>
            <StatusLabel label={state} />
            {progressBar}
        </Flex>
    );
}
