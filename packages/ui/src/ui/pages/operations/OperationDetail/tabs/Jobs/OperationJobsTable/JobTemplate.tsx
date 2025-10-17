import React from 'react';
import {Progress} from '@gravity-ui/uikit';
import Link from '../../../../../../components/Link/Link';
import {Template} from '../../../../../../components/MetaTable/templates/Template';
import {showErrorModal} from '../../../../../../store/actions/actions';
import {showInputPaths} from '../../../../../../store/actions/operations/jobs';
import {useDispatch} from '../../../../../../store/redux-hooks';
import {Job} from '../job-selector';

/* ----------------------------------------------------------------------------------------------------------------- */

function JobError({error}: {error: Error}) {
    const dispatch = useDispatch();
    return (
        <div>
            <Template.Error error={error} onClick={() => dispatch(showErrorModal(error))} />
        </div>
    );
}

/* ----------------------------------------------------------------------------------------------------------------- */

function JobInputPaths({job}: {job: Job}) {
    const dispatch = useDispatch();
    return (
        <Link theme="ghost" onClick={() => dispatch(showInputPaths(job))}>
            View
        </Link>
    );
}

/* ----------------------------------------------------------------------------------------------------------------- */

function JobDebugInfo({type, job}: {type: 'stderr' | 'fail_context' | 'full_input'; job: Job}) {
    const {size, url} = job.getDebugInfo(type)!;
    return <Template.DownloadLink url={url} size={size} />;
}

/* ----------------------------------------------------------------------------------------------------------------- */

export type JobProgressState = 'running' | 'completed' | 'failed' | 'aborted';
function JobProgress({state, progress}: {state: JobProgressState; progress: number}) {
    const RESOLVED_PROGRESS = 100;
    const PENDING_PROGRESS = 0;

    switch (state) {
        case 'running':
            return <Progress size="s" value={progress * 100} theme="info" />;
        case 'completed':
            return <Progress size="s" value={RESOLVED_PROGRESS} theme="success" />;
        case 'failed':
            return <Progress size="s" value={RESOLVED_PROGRESS} theme="danger" />;
        case 'aborted':
            return <Progress size="s" value={RESOLVED_PROGRESS} theme="default" />;
        default:
            return <Progress size="s" value={PENDING_PROGRESS} />;
    }
}

/* ----------------------------------------------------------------------------------------------------------------- */

export default function JobTemplate() {}

JobTemplate.Error = JobError;
JobTemplate.InputPaths = JobInputPaths;
JobTemplate.DebugInfo = JobDebugInfo;
JobTemplate.Progress = JobProgress;
