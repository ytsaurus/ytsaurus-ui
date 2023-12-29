import {omit} from 'lodash';
import {QueryItem} from '../api';

export const cleanupQueryForDraft = (query: QueryItem): QueryItem => {
    return {
        ...query,
        annotations: omit(query.annotations, 'is_tutorial'),
    };
};

export const prepareQueryPlanIds = (query: QueryItem): QueryItem => {
    const nodes = query.progress?.yql_plan?.Basic.nodes;
    const links = query.progress?.yql_plan?.Basic.links;
    const operations = query.progress?.yql_plan?.Detailed?.Operations;
    if (nodes) {
        nodes.forEach((node) => {
            node.id = String(node.id);
        });
    }
    if (links) {
        links.forEach((link) => {
            link.source = String(link.source);
            link.target = String(link.target);
        });
    }
    if (operations) {
        operations.forEach((operation) => {
            operation.Id = String(operation.Id);
            if (operation.DependsOn) {
                operation.DependsOn = operation.DependsOn.map(String);
            }
        });
    }

    if (!query.access_control_object) {
        query.access_control_object = 'nobody';
    }

    return query;
};
