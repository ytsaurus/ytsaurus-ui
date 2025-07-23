// see https://github.com/ytsaurus/ytsaurus/blob/4ff6c0d/yt/yt/flow/lib/client/public.h#L20-L28
export type NavigationFlowState =
    | 'Unknown'
    | 'Stopped'
    | 'Paused'
    | 'Working'
    | 'Draining'
    | 'Pausing'
    | 'Completed';

export type StatusLabelState =
    | 'aborted'
    | 'aborting'
    | 'completed'
    | 'completing'
    | 'failed'
    | 'failing'
    | 'initializing'
    | 'materializing'
    | 'pending'
    | 'preparing'
    | 'reviving'
    | 'running'
    | 'starting'
    | 'suspended'
    | 'waiting';
