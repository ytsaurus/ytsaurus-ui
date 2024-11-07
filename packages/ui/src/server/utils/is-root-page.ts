import type {Request} from 'express';

import {ODIN_PAGE_ID} from '../../shared/constants';
import ServerFactory from '../ServerFactory';

export function isRootPage(req: Request, page: string) {
    const rootPages = [
        ...(req.ctx.config?.odinBaseUrl ? [ODIN_PAGE_ID] : []),
        ...ServerFactory.getExtraRootPages(),
    ];
    return -1 !== rootPages.indexOf(page);
}
