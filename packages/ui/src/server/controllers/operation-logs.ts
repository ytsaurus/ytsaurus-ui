import type {Request, Response} from 'express';
import {sendAndLogError} from '../utils';
import axios from 'axios';

export async function operationLogsList(req: Request, res: Response): Promise<void> {
    try {
        const {
            params: {operationId},
            body: {cluster},
        } = req;
        const resp = await axios.post(`someurl/list/${operationId}`, {
            cluster,
        });
        res.send(resp);
    } catch (error: any) {
        sendAndLogError(req.ctx, res, 500, error);
    }
}

export async function operationLogsView(req: Request, res: Response) {
    try {
        const {
            params: {operationId},
            body: {cluster},
        } = req;
        const resp = await axios.post(`someurl/view/${operationId}`, {
            cluster,
        });
        res.send(resp);
    } catch (error: any) {
        sendAndLogError(req.ctx, res, 500, error);
    }
}
