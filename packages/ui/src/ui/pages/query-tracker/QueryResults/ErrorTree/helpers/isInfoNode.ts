import {QueryError} from '../../../../../types/query-tracker/api';

const INFO_NODE_SEVERITY = 'Info';

export const isInfoNode = (node: QueryError) => {
    return node.attributes.severity === INFO_NODE_SEVERITY;
};
