export enum QueryStatus {
    DRAFT = 'draft',
    RUNNING = 'running',
    PENDING = 'pending',
    COMPLETING = 'completing',
    COMPLETED = 'completed',
    FAILING = 'failing',
    FAILED = 'failed',
    ABORTING = 'aborting',
    ABORTED = 'aborted',
}

export const ProgressStatuses = [
    QueryStatus.RUNNING,
    QueryStatus.PENDING,
    QueryStatus.COMPLETING,
    QueryStatus.FAILING,
    QueryStatus.ABORTING,
];
