import {useCallback, useState} from 'react';

import {ytApiV4} from '../../../../rum/rum-wrap-api';
import {toaster} from '../../../../utils/toaster';
import {showErrorPopup} from '../../../../utils/utils';
import {YTError} from '../../../../types';

type Props = (data: {jobId?: string; command?: string; shellName?: string}) => {
    run: () => void;
    loading: boolean;
    error: YTError | null;
};

export const useRunJobShellCommand: Props = ({jobId, command, shellName}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<YTError | null>(null);

    const run = useCallback(() => {
        if (!jobId || !command) {
            return;
        }

        setLoading(true);
        setError(null);

        ytApiV4
            .runJobShellCommand({
                job_id: jobId,
                command,
                ...(shellName && {shell_name: shellName}),
            })
            .then((response: unknown) => {
                console.log('runJobShellCommand result:', response);
            })
            .catch((err: YTError) => {
                setError(err);
                toaster.add({
                    theme: 'danger',
                    name: 'run-job-shell-command',
                    autoHiding: false,
                    content: err?.message || 'Oops, something went wrong',
                    title: 'Failed to run job shell command',
                    actions: [{label: 'Details', onClick: () => showErrorPopup(err)}],
                });
            })
            .finally(() => {
                setLoading(false);
            });
    }, [jobId, command, shellName]);

    return {
        run,
        loading,
        error,
    };
};
