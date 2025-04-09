import {QueryEngine} from '../../../../../shared/constants/engines';

export const makePathByQueryEngine = ({
    path,
    cluster,
    engine,
}: {
    path: string;
    cluster: string;
    engine: QueryEngine;
}) => {
    if (!path || path === '/') return cluster;

    switch (engine) {
        case QueryEngine.YQL:
            return cluster + '.`' + path + '`';
        case QueryEngine.YT_QL:
            return '`' + path + '`';
        case QueryEngine.CHYT:
            return '`' + path + '`';
        default:
            return 'yt.`ytTable:' + path + '`';
    }
};
