import {selectCluster} from '../../../store/selectors/global/cluster';
import {useSelector} from '../../../store/redux-hooks';
import {type YTEndpointApiArgs} from './types';

export function useCurrentClusterArgs<T>(args: YTEndpointApiArgs<T>) {
    const cluster = useSelector(selectCluster);

    if ('setup' in args) {
        return args;
    }

    return Object.assign({cluster}, args);
}
