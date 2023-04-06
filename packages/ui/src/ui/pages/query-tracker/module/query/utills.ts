import {omit} from 'lodash';
import {QueryItem} from '../api';

export const cleanupQueryForDraft = (query: QueryItem): QueryItem => {
    return {
        ...query,
        annotations: omit(query.annotations, 'is_tutorial'),
    };
};
