import type {Request, Response} from 'express';
// @ts-ignore
import ytLib from '@ytsaurus/javascript-wrapper';

import {USE_MAX_SIZE} from '../../shared/constants/yt-api';

import {sendAndLogError} from '../utils';
import {getUserYTApiSetup} from '../components/requestsSetup';
import {YTError} from '../../@types/types';

const yt = ytLib();

export async function getClusterPools(req: Request, res: Response) {
    try {
        req.ctx.log('Test', req.params);
        const {ytAuthCluster} = req.params as {ytAuthCluster: string};
        const {poolTree} = req.query;
        let cfg;
        try {
            cfg = getUserYTApiSetup(ytAuthCluster, req);
        } catch (e: any) {
            sendAndLogError(req.ctx, res, 400, e);
            return;
        }
        const {setup} = cfg;

        const {names, tree} = await loadPoolTree(setup, poolTree as string);
        res.send({tree, names});
    } catch (e: any) {
        sendAndLogError(req.ctx, res, null, e);
    }
}

const SCHEDULER_POOL_TREES = '//sys/scheduler/config/pool_trees_root';

interface PoolTree extends Record<string, PoolTree> {}

async function loadPoolTree(
    setup: unknown,
    poolTree?: string,
): Promise<{names: Array<string>; tree: string}> {
    const poolTreesRoot = await getPoolTreeRootPath(setup);

    const tree = poolTree ? poolTree : await loadDefaultPoolTree(setup, poolTreesRoot);
    const data: PoolTree = await yt.v3.get({
        setup,
        parameters: {path: `${poolTreesRoot}/${tree}`, ...USE_MAX_SIZE},
    });

    const names: Array<string> = [];
    const stack = [data];
    while (stack.length) {
        const item = stack.pop();
        Object.keys(item ?? {}).forEach((k) => {
            names.push(k);
            if (item) {
                stack.push(item[k]);
            }
        });
    }

    return {names, tree};
}

function getPoolTreeRootPath(setup: unknown): Promise<string> {
    return yt.v3.get({setup, parameters: {path: SCHEDULER_POOL_TREES}}).then(
        (path: string) => {
            return path;
        },
        (err: YTError) => {
            return err.code === yt.codes.NODE_DOES_NOT_EXIST
                ? '//sys/pool_trees'
                : Promise.reject(err);
        },
    );
}

async function loadDefaultPoolTree(setup: unknown, poolTreesRoot: string) {
    const path = `${poolTreesRoot}/@default_tree`;
    return yt.v3
        .get({setup, parameters: {path}})
        .then((defaultTree: string) => {
            return defaultTree || 'physical';
        })
        .catch((error: any) => {
            if (error && error.code === yt.codes.NODE_DOES_NOT_EXIST) {
                return 'physical';
            }
            throw error;
        });
}
