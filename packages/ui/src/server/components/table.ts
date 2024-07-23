import some_ from 'lodash/some';
import objectHash from 'object-hash';
// @ts-ignore-next-line
import ytLib from '@ytsaurus/javascript-wrapper';
import {getRobotYTApiSetup} from './requestsSetup';

const yt = ytLib();

const SHA1_REGEXP = /^[0-9a-f]{40}$/;

interface PresetConfig {
    cluster?: string;
    dynamicTablePath: string;
}

export async function getColumnPreset(
    {dynamicTablePath, cluster}: PresetConfig,
    hash: string,
    ytAuthCluster: string,
): Promise<Array<string> | undefined> {
    if (!SHA1_REGEXP.test(hash)) {
        throw new Error('The hash parameter should be defined as a valid sha1-hash string');
    }

    const {setup: setupConfig} = getRobotYTApiSetup(cluster || ytAuthCluster);

    const query = `* FROM [${dynamicTablePath}] WHERE hash="${hash}" LIMIT 1`;
    const result = await yt.v3.selectRows({
        setup: setupConfig,
        parameters: {
            query,
            output_format: {
                $value: 'json',
                $attributes: {
                    field_weight_limit: 100000,
                    encode_utf8: 'false',
                },
            },
        },
    });

    if (!result) {
        return undefined;
    }

    let columns: Array<string> = [];
    try {
        columns = JSON.parse(JSON.parse(result).columns_json);
    } catch (e) {
        throw new Error(`Failed to parse ${hash}-preset`);
    }

    if (!Array.isArray(columns) || some_(columns, (i) => 'string' !== typeof i)) {
        throw new Error(`${hash}-preset is not an array of strings`);
    }
    return columns;
}

export async function saveColumnPreset(
    {dynamicTablePath, cluster}: PresetConfig,
    columns: unknown | Array<string>,
    ytAuthCluster: string,
): Promise<string> {
    if (!Array.isArray(columns) || some_(columns, (i) => 'string' !== typeof i)) {
        throw new Error('Request body should contain JSON-array of strings');
    }

    const {setup: setupConfig} = getRobotYTApiSetup(cluster || ytAuthCluster);

    const hash = objectHash.sha1(columns);

    await yt.v3.insertRows({
        setup: setupConfig,
        parameters: {
            path: dynamicTablePath,
            input_format: {
                $value: 'json',
                $attributes: {
                    encode_utf8: 'false',
                },
            },
        },
        data: [{hash, columns_json: JSON.stringify(columns)}],
    });

    return hash;
}
