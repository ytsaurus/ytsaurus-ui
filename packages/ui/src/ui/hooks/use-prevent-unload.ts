import {useCallback, useEffect} from 'react';

export const usePreventUnload = ({shouldListen}: {shouldListen: boolean}) => {
    const beforeUnloadHandler = useCallback((e: BeforeUnloadEvent) => {
        e.preventDefault();

        // Included for legacy support, e.g. Chrome/Edge < 119
        e.returnValue = true;
    }, []);

    useEffect(() => {
        if (shouldListen) {
            window.addEventListener('beforeunload', beforeUnloadHandler);
        }

        return () => window.removeEventListener('beforeunload', beforeUnloadHandler);
    }, [shouldListen]);
};
