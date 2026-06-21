import ypath from '../../../../../../common/thor/ypath';
import {ytApiV3} from '../../../../../../rum/rum-wrap-api';
import i18n from './i18n';

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
            return i18n('alert_parent-path-not-directory');
        }

        if (path && path.split('/').at(-1)?.length === 0) {
            return i18n('alert_consumer-name-empty');
        }

        if (res[2]?.output) {
            return i18n('alert_path-already-exists');
        }

        return undefined;
    } catch (err) {
        const e = err as Error;
        return e?.message || i18n('alert_unexpected-error', {type: typeof e});
    }
}
