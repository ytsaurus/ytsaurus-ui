import {useMemo} from 'react';
import {useSelector} from '../../../../store/redux-hooks';
import {getClusterUiConfig} from '../../../../store/selectors/global';
import {formatByParams} from '../../../../../shared/utils/format';

export const useJobProfilingUrl = ({
    operationId,
    jobId,
    pool_tree,
    has_trace,
    cluster,
}: {
    operationId?: string;
    jobId?: string;
    cluster: string;
    has_trace?: boolean;
    pool_tree?: string;
}) => {
    const {job_trace_url_template: {url_template, title = 'Open trace', enforce_for_trees} = {}} =
        useSelector(getClusterUiConfig);
    return useMemo(() => {
        const allowTrace = has_trace || 0 <= enforce_for_trees?.indexOf(pool_tree!)!;

        if (!allowTrace || !cluster || !operationId || !jobId || !url_template) {
            return {};
        }
        return {
            url: formatByParams(url_template, {
                operationId,
                jobId,
                cluster,
            }),
            title,
        };
    }, [cluster, operationId, jobId, url_template, title, enforce_for_trees, pool_tree, has_trace]);
};
