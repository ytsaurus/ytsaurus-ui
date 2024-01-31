import type {Request, Response} from 'express';
import {getColumnPreset, saveColumnPreset} from '../components/table';
import {prepareErrorToSend} from '../utils';

export async function tableColumnPresetGet(req: Request, res: Response) {
    const {
        params: {hash, ytAuthCluster},
    } = req;
    try {
        const presetsConfig = checkEnabled(req);
        const columns = await getColumnPreset(presetsConfig, hash, ytAuthCluster);
        if (!columns) {
            const err = new Error(`Cannot find column-preset by the hash '${hash}'`);
            req.ctx.logError('Failed to get preset of columns', err);
            res.status(404).send(prepareErrorToSend(err));
        }

        res.status(200).send({hash, columns});
    } catch (err) {
        req.ctx.logError('Failed to get preset of columns', err);
        res.status(500).send(prepareErrorToSend(err));
    }
}

export async function tableColumnPresetSave(req: Request, res: Response) {
    const {body} = req;
    const {
        params: {ytAuthCluster},
    } = req;
    try {
        const presetsConfig = checkEnabled(req);
        const result = await saveColumnPreset(presetsConfig, body, ytAuthCluster);
        res.status(200).send(result);
    } catch (err) {
        req.ctx.logError('Failed to save preset of columns', err);
        res.status(500).send(prepareErrorToSend(err));
    }
}

function checkEnabled(req: Request) {
    const {userColumnPresets} = req.ctx.config;

    if (!userColumnPresets) {
        throw new Error(
            "Users' table column presets are not enabled. You have to provide 'userColumnPresets' section in your config to use it.",
        );
    }
    return userColumnPresets;
}

export function isUserColumnPresetsEnabled(req: Request) {
    return Boolean(req.ctx.config.userColumnPresets);
}
