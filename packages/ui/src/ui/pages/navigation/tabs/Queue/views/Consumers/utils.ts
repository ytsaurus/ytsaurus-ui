import ypath from '../../../../../../common/thor/ypath';
import {ytApiV3} from '../../../../../../rum/rum-wrap-api';

export async function validateCreateConsumerPath(path: string) {
    try {
        const parentPath = path
            .split('/')
            .slice(0, path.split('/').length - 1)
            .join('/');

        const res = await ytApiV3.executeBatch({
            parameters: {
                requests: [
                    {
                        command: 'get' as const,
                        parameters: {
                            path: `${parentPath}/@`,
                        },
                    },
                    {
                        command: 'get' as const,
                        parameters: {
                            path: `${path}/@`,
                        },
                    },
                    {
                        command: 'exists' as const,
                        parameters: {
                            path,
                        },
                    },
                ],
            },
        });

        if (ypath.getValue(res[0]?.output, '/type') !== 'map_node') {
            return 'Parent path should be a directory';
        }

        if (path && path.split('/').at(-1)?.length === 0) {
            return 'Consumer name should not be empty';
        }

        if (res[2]?.output) {
            return 'Path should not exist';
        }

        return undefined;
    } catch (err) {
        const e = err as Error;
        return e?.message || 'Unexpected type of error: ' + typeof e;
    }
}
