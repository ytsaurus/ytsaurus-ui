import type {QueryError} from '../../../../../types/query-tracker/api';

const INFO_NODE_SEVERITY = 'Info';
const WARNING_NODE_SEVERITY = 'Warning';

export const getNodeSeverityType = (node: QueryError) => {
    const severity = node.attributes?.severity;
    const isInfo = severity === INFO_NODE_SEVERITY;
    const isWarning = severity === WARNING_NODE_SEVERITY;

    return {
        isInfo,
        isWarning,
        isError: !isInfo && !isWarning,
    };
};
