import {useEffect, useState} from 'react';

import ypath from '../../../../common/thor/ypath';
import {ytApiV3} from '../../../../rum/rum-wrap-api';
import {JobState} from '../../../../types/operations/job';

type Props = (data: {operationId?: string; jobState?: JobState}) => boolean;

export const useIsGpuProfilerAvailable: Props = ({operationId, jobState}) => {
    const [isAvailable, setIsAvailable] = useState(false);
    const isJobRunning = jobState === 'running';

    useEffect(() => {
        if (!operationId || !isJobRunning) {
            setIsAvailable(false);
            return;
        }

        ytApiV3
            .getOperation({
                parameters: {
                    operation_id: operationId,
                    attributes: ['full_spec'],
                },
            })
            .then((operation) => {
                const kinetoConfig = ypath.getValue(
                    operation,
                    '/full_spec/cuda_profiler_environment_variables/KINETO_CONFIG',
                );
                setIsAvailable(Boolean(kinetoConfig));
            })
            .catch(() => {
                setIsAvailable(false);
            });
    }, [operationId, isJobRunning]);

    return isAvailable;
};
