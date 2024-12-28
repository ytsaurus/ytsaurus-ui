import ELK, {ElkLayoutArguments, ElkNode} from 'elkjs';
import {useCallback, useEffect, useMemo, useState} from 'react';

export const useElk = (config: ElkNode, args?: ElkLayoutArguments) => {
    const [result, setResult] = useState<ElkNode | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const memoizedConfig = useMemo(() => config, [config]);
    const memoizedArgs = useMemo(() => args, [args]);

    const layout = useCallback(() => {
        const elk = new ELK();
        return elk.layout(memoizedConfig, memoizedArgs);
    }, [memoizedConfig, memoizedArgs]);

    useEffect(() => {
        let isCancelled = false;

        layout()
            .then((data) => {
                if (!isCancelled) {
                    setResult(data);
                    setIsLoading(false);
                }
            })
            .catch((error) => {
                if (!isCancelled) {
                    console.error('Error during ELK layout:', error);
                    setIsLoading(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [layout]);

    return {result, isLoading};
};
