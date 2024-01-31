import type {Request, Response} from 'express';
import {create, deleteItem, get, getItem, setItem} from '../components/settings';
import {sendError} from '../utils';

function sendResponse(_req: Request, res: Response, data: object) {
    return res.set('content-type', 'application/json').status(200).send(JSON.stringify(data));
}

export function settingsCreate(req: Request, res: Response) {
    const {
        ctx,
        params: {username, ytAuthCluster},
    } = req;

    return create({ctx, username, ytAuthCluster})
        .then(sendResponse.bind(null, req, res))
        .catch(sendError.bind(null, res));
}
export function settingsGet(req: Request, res: Response) {
    const {
        ctx,
        params: {username, ytAuthCluster},
    } = req;

    return get({ctx, username, ytAuthCluster})
        .then(sendResponse.bind(null, req, res))
        .catch(sendError.bind(null, res));
}
export async function settingsGetItem(req: Request, res: Response) {
    const {
        ctx,
        params: {username, path, ytAuthCluster},
    } = req;

    return getItem({ctx, username, path, ytAuthCluster})
        .then(sendResponse.bind(null, req, res))
        .catch(sendError.bind(null, res));
}
export function settingsSetItem(req: Request, res: Response) {
    const {
        ctx,
        params: {username, path, ytAuthCluster},
        body: {value} = {},
    } = req;

    return setItem({ctx, username, path, value, ytAuthCluster})
        .then(sendResponse.bind(null, req, res))
        .catch(sendError.bind(null, res));
}
export function settingsDeleteItem(req: Request, res: Response) {
    const {
        ctx,
        params: {username, path, ytAuthCluster},
    } = req;

    return deleteItem({ctx, username, path, ytAuthCluster})
        .then(sendResponse.bind(null, req, res))
        .catch(sendError.bind(null, res));
}
