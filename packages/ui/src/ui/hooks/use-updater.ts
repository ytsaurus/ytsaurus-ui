import React from 'react';
import Updater from '../utils/hammer/updater';

export const DEFAULT_UPDATER_TIMEOUT = 30 * 1000;

const UPDATER_ID = 'UPDATER_ID';

export function useUpdater(fn: () => unknown, timeout = DEFAULT_UPDATER_TIMEOUT) {
    const [updater] = React.useState(new Updater());
    React.useEffect(() => {
        updater.add(UPDATER_ID, fn, timeout);
        return () => {
            updater.remove(UPDATER_ID);
        };
    }, [updater, fn, timeout]);
}
