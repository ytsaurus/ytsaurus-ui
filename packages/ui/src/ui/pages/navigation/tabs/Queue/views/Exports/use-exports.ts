import {useSelector} from 'react-redux';

import {useFetchBatchQuery} from '../../../../../../store/api/yt';
import {makeGetExportsParams} from '../../../../../../store/api/navigation/tabs/queue/queue';

import {getPath} from '../../../../../../store/selectors/navigation';

import {QueueExport} from '../../../../../../types/navigation/queue/queue';

import {ExportConfigColumns} from './Exports';

export function useExports() {
    const path = useSelector(getPath);

    const {
        data: config,
        isLoading,
        isFetching,
    } = useFetchBatchQuery<QueueExport<number>>(makeGetExportsParams(path));

    const data: ExportConfigColumns[] = [];

    if (config && config[0].output) {
        for (const obj in config[0].output) {
            if (obj) {
                const newObj: ExportConfigColumns = {
                    ...config[0].output[obj],
                    export_name: obj,
                    id: obj,
                };
                data.push(newObj);
            }
        }
    }

    return {data, isLoading, isFetching};
}
