import type {Request} from 'express';

export function replaceDomainForSetCookie(setCookieItem: string, domain: string) {
    const parts = setCookieItem.split(/;\s*/);

    const index = parts.findIndex((x) => x.toLowerCase().startsWith('domain'));
    if (index !== -1) {
        parts[index] = `Domain=${domain}`;
    } else {
        parts.push(`Domain=${domain}`);
    }

    return parts.join('; ');
}

export function makeAuthCookieOptions(req: Request) {
    const {authCookieDomain: domain} = req.ctx.config;
    return domain ? {domain} : {};
}
