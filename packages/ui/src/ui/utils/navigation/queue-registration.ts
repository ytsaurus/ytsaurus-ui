import ypath from '../../common/thor/ypath';

type ClusterType = string;
type PathType = string;

export type QueueRegistrationPath =
    | `${ClusterType}:${PathType}`
    | {$value: string; $attributes: {cluster: string; queue_consumer_name?: string}};

// Registrations use either a legacy cluster:path or a YSON attributed string.
export function parseQueueRegistrationPath(value: QueueRegistrationPath | string) {
    if (typeof value !== 'string') {
        const attributes = ypath.getAttributes(value);
        return {
            cluster: attributes.cluster,
            path: ypath.getValue(value),
            consumerName: attributes.queue_consumer_name,
        };
    }
    // A YPath may contain colons, so split only at the first separator.
    const separator = value.indexOf(':');
    return {
        cluster: separator < 0 ? '' : value.slice(0, separator),
        path: separator < 0 ? value : value.slice(separator + 1),
        consumerName: undefined,
    };
}

export function formatQueueRegistrationPath(value: QueueRegistrationPath) {
    const {cluster, path, consumerName} = parseQueueRegistrationPath(value);
    const fullPath = cluster ? `${cluster}:${path}` : path;
    return consumerName === undefined ? fullPath : `${fullPath} (${consumerName})`;
}
