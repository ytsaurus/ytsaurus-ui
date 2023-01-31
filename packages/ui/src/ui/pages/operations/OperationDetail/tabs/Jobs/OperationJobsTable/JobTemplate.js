import React from 'react';
import PropTypes from 'prop-types';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import {Progress} from '@gravity-ui/uikit';

import hammer from '../../../../../../common/hammer';
import Link from '../../../../../../components/Link/Link';
import {Template} from '../../../../../../components/MetaTable/templates/Template';
import {showErrorModal} from '../../../../../../store/actions/actions';
import {showInputPaths} from '../../../../../../store/actions/operations/jobs';
import {useDispatch} from 'react-redux';

/* ----------------------------------------------------------------------------------------------------------------- */

function JobError({error}) {
    const dispatch = useDispatch();
    return (
        <div>
            <Template.Error error={error} onClick={() => dispatch(showErrorModal(error))} />
        </div>
    );
}

JobError.propTypes = {
    error: PropTypes.object,
};

/* ----------------------------------------------------------------------------------------------------------------- */

function JobInputPaths({job}) {
    const dispatch = useDispatch();
    return (
        <Link theme="ghost" onClick={() => dispatch(showInputPaths(job))}>
            View
        </Link>
    );
}

JobInputPaths.propTypes = {
    job: PropTypes.object.isRequired,
};

/* ----------------------------------------------------------------------------------------------------------------- */

function JobDebugInfo({type, job}) {
    const {size, url} = job.getDebugInfo(type);
    return <Template.DownloadLink url={url} size={size} />;
}

JobDebugInfo.propTypes = {
    type: PropTypes.oneOf(['stderr', 'fail_context', 'full_input']).isRequired,
    job: PropTypes.object.isRequired,
};

/* ----------------------------------------------------------------------------------------------------------------- */

function JobProgress({state, progress}) {
    const RESOLVED_PROGRESS = 100;
    const PENDING_PROGRESS = 0;

    switch (state) {
        case 'running':
            return <Progress view="thin" value={progress * 100} theme="info" />;
        case 'completed':
            return <Progress view="thin" value={RESOLVED_PROGRESS} theme="success" />;
        case 'failed':
            return <Progress view="thin" value={RESOLVED_PROGRESS} theme="danger" />;
        case 'aborted':
            return <Progress view="thin" value={RESOLVED_PROGRESS} theme="default" />;
        default:
            return <Progress view="thin" value={PENDING_PROGRESS} />;
    }
}

JobProgress.propTypes = {
    state: PropTypes.string,
    progress: PropTypes.number,
};

/* ----------------------------------------------------------------------------------------------------------------- */

function renderStatistics(state, statistics) {
    const [rowCount, dataSize] = ypath.getValues(statistics, [
        '/processed_input_row_count',
        '/processed_input_uncompressed_data_size',
    ]);
    return (
        (state === 'running' || state === 'completed') &&
        `${hammer.format['Number'](rowCount)} (${hammer.format['Bytes'](dataSize)})`
    );
}

function JobStatistics({state, statistics}) {
    return statistics ? renderStatistics(state, statistics) : null;
}

JobStatistics.propTypes = {
    state: PropTypes.string,
    statistics: PropTypes.object,
};

/* ----------------------------------------------------------------------------------------------------------------- */

export default function JobTemplate() {}

JobTemplate.Error = JobError;
JobTemplate.InputPaths = JobInputPaths;
JobTemplate.DebugInfo = JobDebugInfo;
JobTemplate.Progress = JobProgress;
JobTemplate.Statistics = JobStatistics;
