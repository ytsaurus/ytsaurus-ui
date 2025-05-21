import {ytApiV3} from '../../rum/rum-wrap-api';

export async function validatePathExistance(path: string) {
    try {
        const res = await ytApiV3.executeBatch({
            parameters: {
                requests: [
                    {
                        command: 'exists' as const,
                        parameters: {
                            path,
                        },
                    },
                ],
            },
        });

        if (!res[0]?.output) {
            return 'Path should exist';
        }

        return undefined;
    } catch (err) {
        const e = err as Error;
        return e?.message || 'Unexpected type of error: ' + typeof e;
    }
}
