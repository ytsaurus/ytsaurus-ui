import omit_ from 'lodash/omit';
import {type QueryItem, isSingleProgress} from './api';

export const cleanupQueryForDraft = (query: QueryItem): QueryItem => {
    return {
        ...query,
        annotations: omit_(query.annotations, 'is_tutorial'),
    };
};

export const prepareQueryPlanIds = (accQuery: QueryItem, defaultQueryACO: string): QueryItem => {
    if (isSingleProgress(accQuery.progress)) {
        const nodes = accQuery.progress?.yql_plan?.Basic.nodes;
        const links = accQuery.progress?.yql_plan?.Basic.links;
        const operations = accQuery.progress?.yql_plan?.Detailed?.Operations;
        if (nodes) {
            nodes.forEach((accNode) => {
                accNode.id = String(accNode.id);
            });
        }
        if (links) {
            links.forEach((accLink) => {
                accLink.source = String(accLink.source);
                accLink.target = String(accLink.target);
            });
        }
        if (operations) {
            operations.forEach((accOperation) => {
                accOperation.Id = String(accOperation.Id);
                if (accOperation.DependsOn) {
                    accOperation.DependsOn = accOperation.DependsOn.map(String);
                }
            });
        }
    }

    if (!accQuery.access_control_objects) {
        accQuery.access_control_objects = [defaultQueryACO];
    }

    return accQuery;
};
