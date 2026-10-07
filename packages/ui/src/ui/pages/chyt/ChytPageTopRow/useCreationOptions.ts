import React from 'react';

import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {wrapApiPromiseByToaster} from '../../../utils/utils';

import {type CreationOptions} from './creation-options';
import {loadCreationOptions} from './creation-options-api';
import i18n from './i18n';

export function useCreationOptions(cluster: string, isAdmin: boolean) {
    const [requests] = React.useState(() => ({id: 0, cancelHelper: new CancelHelper()}));
    const [state, setState] = React.useState<{
        cluster: string;
        isAdmin: boolean;
        loading: boolean;
        options?: CreationOptions;
    }>();

    React.useEffect(() => {
        setState(undefined);

        return () => {
            ++requests.id;
            requests.cancelHelper.removeAllRequests();
        };
    }, [requests, cluster, isAdmin]);

    async function load() {
        const id = ++requests.id;
        setState({cluster, isAdmin, loading: true});

        try {
            const options = await wrapApiPromiseByToaster(
                loadCreationOptions(
                    cluster,
                    isAdmin,
                    requests.cancelHelper.removeAllAndGenerateNextToken(),
                ),
                {
                    toasterName: 'chytCreationOptions',
                    skipSuccessToast: true,
                    errorTitle: i18n('alert_load-options-failed'),
                },
            );

            if (id !== requests.id) {
                return false;
            }

            setState({cluster, isAdmin, loading: false, options});

            return true;
        } catch (error) {
            if (id === requests.id && !isCancelled(error)) {
                setState({cluster, isAdmin, loading: false});
            }

            return false;
        }
    }

    const current = state?.cluster === cluster && state.isAdmin === isAdmin ? state : undefined;

    return {load, loading: current?.loading ?? false, options: current?.options};
}
