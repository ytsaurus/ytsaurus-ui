import {QueryError} from '../../module/api';

export const getIssuePosition = (issue: QueryError) => {
    const position = issue.attributes?.start_position;
    if (!position) {
        return false;
    }
    return `${position.row}:${position.column}`;
};
