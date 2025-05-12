import React from 'react';
import b from 'bem-cn-lite';
import {Flex, Progress} from '@gravity-ui/uikit';

import {OperationProgressInfo} from '../../../../../../../store/api/dashboard2/operations/operations';

import StatusLabel from '../../../../../../../components/StatusLabel/StatusLabel';

import './State.scss';

const block = b('progress');

type Props = {
    progress?: OperationProgressInfo;
};

const PREPARING_STATES = ['materializing', 'initializing', 'preparing', 'pending'];

const RUNNING_STATES = ['running', 'completing', 'failing', 'aborting', 'reviving'];

const intermidiateStates = [...PREPARING_STATES, ...RUNNING_STATES];

const RESOLVED_PROGRESS = 100;
const PENDING_PROGRESS = 0;

export function State({progress}: Props) {
    let progressBar;

    if (!progress || !progress.state) {
        return (
            <Flex direction={'column'} gap={1}>
                <StatusLabel label={'failed'} className={block('label')} />
                <Progress className={block('bar')} size={'s'} value={0} text={'-'} />
            </Flex>
        );
    }

    switch (progress.state) {
        case 'running':
            progressBar = intermidiateStates.includes(progress.state) && (
                <Progress
                    size={'s'}
                    value={progress?.jobs || 0}
                    className={block('bar')}
                    stack={[
                        {
                            value: progress?.completed || 0,
                            theme: 'success',
                        },
                        {value: progress?.running || 0, theme: 'info'},
                    ]}
                />
            );
            break;
        case 'completed':
            progressBar = (
                <Progress
                    size={'s'}
                    value={RESOLVED_PROGRESS}
                    theme={'success'}
                    className={block('bar')}
                />
            );
            break;
        case 'failed':
            progressBar = (
                <Progress
                    size={'s'}
                    value={RESOLVED_PROGRESS}
                    theme={'danger'}
                    className={block('bar')}
                />
            );
            break;
        case 'aborted':
            progressBar = (
                <Progress
                    size={'s'}
                    value={RESOLVED_PROGRESS}
                    theme={'default'}
                    className={block('bar')}
                />
            );
            break;
        default:
            progressBar = (
                <Progress size={'s'} value={PENDING_PROGRESS || 0} className={block('bar')} />
            );
            break;
    }

    return (
        <Flex direction={'column'} gap={1}>
            <StatusLabel label={progress.state} className={block('label')} />
            {progressBar}
        </Flex>
    );
}
