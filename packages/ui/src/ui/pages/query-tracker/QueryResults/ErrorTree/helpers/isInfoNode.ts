import {QueryError} from '../../../../../store/actions/queries/api';

const INFO_NODE_SEVERITY = 'Info';

export const isInfoNode = (node: QueryError) => {
    return node.attributes.severity === INFO_NODE_SEVERITY;
};
