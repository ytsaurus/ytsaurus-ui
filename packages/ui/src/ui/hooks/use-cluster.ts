import React from 'react';
import {useLocation} from 'react-router';

export function useClusterFromLocation() {
    const {pathname} = useLocation();
    const res = React.useMemo(() => {
        const [_first, cluster] = pathname.split('/');
        return cluster;
    }, [pathname]);
    return res;
}
