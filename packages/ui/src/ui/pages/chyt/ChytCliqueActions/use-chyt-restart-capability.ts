import React from 'react';

import {useSelector} from '../../../store/redux-hooks';
import {selectIsAdmin} from '../../../store/selectors/global/is-developer';
import CancelHelper from '../../../utils/cancel-helper';
import {chytApiAction} from '../../../utils/strawberryControllerApi';

export type ChytRestartCapability = {force: boolean};

export function useChytRestartCapability(cluster: string): ChytRestartCapability | undefined {
    const isAdmin = useSelector(selectIsAdmin);
    const [result, setResult] = React.useState<{
        cluster: string;
        isAdmin: boolean;
        capability: ChytRestartCapability;
    }>();

    React.useEffect(() => {
        setResult(undefined);
        const cancelHelper = new CancelHelper();
        const cancelToken = cancelHelper.generateNextToken();
        chytApiAction('describe', cluster, {}, {isAdmin, cancelToken, skipErrorToast: true})
            .then(({commands}) => {
                cancelToken.throwIfRequested();
                const restart = commands.find(({name}) => name === 'restart');
                if (restart) {
                    setResult({
                        cluster,
                        isAdmin,
                        capability: {
                            force: restart.parameters?.some(({name}) => name === 'force') ?? false,
                        },
                    });
                }
            })
            .catch(() => {});
        return cancelHelper.removeAllRequests;
    }, [cluster, isAdmin]);

    return result?.cluster === cluster && result.isAdmin === isAdmin
        ? result.capability
        : undefined;
}
