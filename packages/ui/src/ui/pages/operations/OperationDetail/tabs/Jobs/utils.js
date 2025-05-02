import moment from 'moment';

import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import hammer from '../../../../../common/hammer';
import {getMetrics} from '../../../../../common/utils/metrics';

function createTemporaryPath(login) {
    const temporaryPathBase = '//tmp/ui/' + login;

    return yt.v3
        .create({
            path: temporaryPathBase,
            type: 'map_node',
            recursive: true,
            ignore_existing: true,
        })
        .then(() => {
            const temporaryPath = '/input_context_' + hammer.format['toBase26'](moment().unix());
            return temporaryPathBase + temporaryPath;
        });
}

export function performJobAction({login, name, item}) {
    const parameters = {job_id: item.id};

    getMetrics().countEvent('operation_detail_running-jobs_action', name);

    let jobActionPromise;

    switch (name) {
        case 'abort':
            jobActionPromise = yt.v3.abortJob(parameters);
            break;
        case 'abandon':
            jobActionPromise = yt.v3.abandonJob(parameters);
            break;
        case 'input_context':
            jobActionPromise = createTemporaryPath(login).then((temporaryPath) => {
                return yt.v3
                    .dumpJobContext(
                        Object.assign({}, parameters, {
                            path: temporaryPath,
                        }),
                    )
                    .then(() => temporaryPath);
            });
            break;
        case 'input':
            jobActionPromise = Promise.resolve('foo');
            break;
    }

    return jobActionPromise;
}
