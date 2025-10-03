import {QueryError} from '../../../../types/query-tracker/api';

export const calculateCloudLevel = (root: QueryError, extracted = 0) => {
    let issue = root;
    let length = 0;
    const levels: QueryError[] = [];
    while (Array.isArray(issue.inner_errors) && issue.inner_errors.length === 1) {
        [issue] = issue.inner_errors;
        levels.unshift(issue);
        length += 1;
    }
    return {issue: levels[extracted], length: length - extracted};
};
