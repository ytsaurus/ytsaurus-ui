export const {BASE_URL, CLUSTER = '', CLUSTER_TITLE} = process.env;

console.log({BASE_URL, CLUSTER, CLUSTER_TITLE});

export function makeUrl(pathWithParams = '') {
    return [BASE_URL, pathWithParams].filter(Boolean).join('/');
}

export function makeClusterUrl(pathWithParams = '') {
    return [BASE_URL, CLUSTER, pathWithParams].filter(Boolean).join('/');
}

export function makeClusterTille({path, page}: {path?: string; page?: string}) {
    return [path, page, CLUSTER_TITLE ?? capitalize(CLUSTER)].filter(Boolean).join(' - ');
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
