import './afterEach';

/**
 * Do not forget to update `../env.names.txt`
 */
export const {
    BASE_URL,
    CLUSTER,
    E2E_SUFFIX,
    E2E_DIR,
    E2E_OPERATION_ID,
    E2E_OPERATION_2_ID,
    CLUSTER_TITLE,
    CLUSTERS_MENU_EXPECT,
    PASSWORD,
    LOGIN,
} = process.env;

const parts = E2E_DIR?.split('/') ?? [];

export const E2E_DIR_NAME = parts[parts.length - 1];

console.log({
    BASE_URL,
    CLUSTER,
    CLUSTER_TITLE,
    E2E_SUFFIX,
    E2E_DIR,
    E2E_OPERATION_ID,
    E2E_OPERATION_2_ID,
    CLUSTERS_MENU_EXPECT,
    LOGIN,
});

if (!CLUSTER || !E2E_DIR) {
    throw new Error('E2E environment is not prepared');
}

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
