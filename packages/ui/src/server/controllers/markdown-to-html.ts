import type {Request, Response} from 'express';
import {sendAndLogError} from '../utils';
import transform from '@diplodoc/transform';

export function markdownToHtmlHandler(req: Request, res: Response) {
    try {
        const {text, allowHTML} = req.body as {text: string; allowHTML: boolean};
        const result = transform(text, {
            disableLiquid: true,
            allowHTML,
            lang: 'en',
        });
        res.send(result);
    } catch (err: any) {
        sendAndLogError(req.ctx, res, 500, err);
    }
}
