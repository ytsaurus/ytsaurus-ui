import omit_ from 'lodash/omit';
import {type QueryItem, isSingleProgress} from './api';

export const cleanupQueryForDraft = (query: QueryItem): QueryItem => {
    return {
        ...query,
        annotations: omit_(query.annotations, 'is_tutorial'),
    };
};

export const prepareQueryPlanIds = (draftQuery: QueryItem, defaultQueryACO: string): QueryItem => {
    if (isSingleProgress(draftQuery.progress)) {
        const nodes = draftQuery.progress?.yql_plan?.Basic.nodes;
        const links = draftQuery.progress?.yql_plan?.Basic.links;
        const operations = draftQuery.progress?.yql_plan?.Detailed?.Operations;
        if (nodes) {
            nodes.forEach((draftNode) => {
                draftNode.id = String(draftNode.id);
            });
        }
        if (links) {
            links.forEach((draftLink) => {
                draftLink.source = String(draftLink.source);
                draftLink.target = String(draftLink.target);
            });
        }
        if (operations) {
            operations.forEach((draftOperation) => {
                draftOperation.Id = String(draftOperation.Id);
                if (draftOperation.DependsOn) {
                    draftOperation.DependsOn = draftOperation.DependsOn.map(String);
                }
            });
        }
    }

    if (!draftQuery.access_control_objects) {
        draftQuery.access_control_objects = [defaultQueryACO];
    }

    return draftQuery;
};
