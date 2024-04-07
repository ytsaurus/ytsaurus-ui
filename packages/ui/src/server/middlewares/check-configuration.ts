import type {Request, Response} from 'express';
import {AppMiddleware} from '@gravity-ui/expresskit';
import {NodeKit} from '@gravity-ui/nodekit';

function checkConfigurationMiddleware(errors: Array<string>): AppMiddleware {
    return function checkConfiguration(_req: Request, res: Response) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        const body = `Please fix the problems below:<br>
            <ol>
                ${errors.map((i) => `<li>${i}</li>`).join('\n')}
            </ol>
            Please refer to the <a target='_blank' href='https://github.com/ytsaurus/ytsaurus-ui/tree/main/packages/ui#migration'>migration notices<a/> for more details.
        `;
        res.status(500).end(body);
    };
}

export function createConfigurationErrorsMidleware({ctx, config}: NodeKit) {
    const configurationErrors: Array<string> = [];
    if (process.env.YT_AUTH_CLUSTER_ID) {
        ctx.logError(
            'The YT_AUTH_CLUSTER_ID environment variable is depricated, please replace it with ALLOW_PASSWORD_AUTH',
        );
    }

    if ('ytAuthCluster' in config) {
        configurationErrors.push(
            'The config setting `config.ytAuthCluster` is no longer supported, please replace it with `config.allowPasswordAuth` or use ALLOW_PASSWORD_AUTH environment variable',
        );
    }

    return configurationErrors.length > 0
        ? checkConfigurationMiddleware([...configurationErrors])
        : undefined;
}
