import path from 'path';
import _reduce from 'lodash/reduce';
import {NodeKit} from '@gravity-ui/nodekit';
import {ExpressKit} from '@gravity-ui/expresskit';

import {configureApp} from './configure-app';

import {createYTAuthMiddleware} from './middlewares/yt-auth';
import routes from './routes';

const nodekit = new NodeKit({configsPath: path.resolve(__dirname, './configs')});

const {appName, appEnv, appInstallation, appDevMode} = nodekit.config;
nodekit.ctx.log('AppConfig details', {
    appName,
    appEnv,
    appInstallation,
    appDevMode,
});

const {ytAuthCluster, appAuthHandler, ytauthConfig} = nodekit.config;

if (ytAuthCluster) {
    if (appAuthHandler) {
        nodekit.ctx.fail(
            new Error(
                '"appAuthHandler" option will be ignored cause "ytAuthCluster" option is provided.',
            ),
        );
    }

    nodekit.config.appAuthHandler = createYTAuthMiddleware(ytAuthCluster, ytauthConfig);
}

nodekit.config.adjustAppConfig?.(nodekit);

const app = new ExpressKit(nodekit, routes);
configureApp(app);

if (require.main === module) {
    app.run();
}

export default app;
