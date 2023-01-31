import {RumMeasureStartProps, useRumMeasureStart} from './RumUiContext';
import {useSelector} from 'react-redux';
import {getCluster} from '../store/selectors/global';

export function useAppRumMeasureStart<T extends Array<any>>(params: RumMeasureStartProps<T>) {
    const cluster = useSelector(getCluster);

    useRumMeasureStart({
        ...params,
        subPage: params.subPage || `ui.${cluster}`,
    });
}
