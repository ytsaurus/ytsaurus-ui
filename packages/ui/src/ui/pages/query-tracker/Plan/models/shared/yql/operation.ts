export interface OperationIssue {
    file?: string;
    row?: number;
    column?: number;
    message?: string;
    code?: number;
    severity?: string;
    issues?: OperationIssue[];
}

export const ISSUE_SEVERITY = {
    FATAL: 'S_FATAL',
    ERROR: 'S_ERROR',
    WARNING: 'S_WARNING',
    INFO: 'S_INFO',
} as const;

export type IssueSeverity = (typeof ISSUE_SEVERITY)[keyof typeof ISSUE_SEVERITY];
