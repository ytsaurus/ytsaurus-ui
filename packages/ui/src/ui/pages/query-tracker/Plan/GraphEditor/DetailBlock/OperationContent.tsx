import React, {FC} from 'react';
import {NodeProgress} from '../../models/plan';
import './OperationContent.scss';
import {JobItem} from './JobItem';
import cn from 'bem-cn-lite';
import {Progress, Text} from '@gravity-ui/uikit';
import {makeJobsScope} from '../helpers/makeJobsScope';
import {JOBS_COLOR_MAP} from '../constants';

const block = cn('graph-operation-content');

type Props = {
    nodeProgress?: NodeProgress;
};

export const OperationContent: FC<Props> = ({nodeProgress}) => {
    if (!nodeProgress || !nodeProgress.total) return null;
    const total = nodeProgress.total + (nodeProgress.aborted || 0);
    const pending = (nodeProgress.pending || 0) + (nodeProgress.running || 0);

    return (
        <div className={block()}>
            <div>
                <Progress size="xs" stack={makeJobsScope(total, nodeProgress)} />
            </div>
            <div className={block('info')}>
                <div>
                    {total} <Text color="secondary">job(s)</Text>
                </div>
                <div className={block('jobs')}>
                    <JobItem
                        color={JOBS_COLOR_MAP.completed}
                        tooltip="completed"
                        value={nodeProgress.completed}
                    />
                    <JobItem color={JOBS_COLOR_MAP.pending} tooltip="pending" value={pending} />
                    <JobItem
                        color={JOBS_COLOR_MAP.aborted}
                        tooltip="aborted"
                        value={nodeProgress.aborted}
                    />
                    <JobItem
                        color={JOBS_COLOR_MAP.failed}
                        tooltip="failed"
                        value={nodeProgress.failed}
                    />
                </div>
            </div>
        </div>
    );
};
