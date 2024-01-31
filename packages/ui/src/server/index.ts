import path from 'path';
import _reduce from 'lodash/reduce';
import {NodeKit} from '@gravity-ui/nodekit';
import {ExpressKit} from '@gravity-ui/expresskit';

import {configureApp} from './configure-app';

import {createYTAuthorizationResolver} from './middlewares/yt-auth';
import routes from './routes';
import {createOAuthAuthorizationResolver} from './middlewares/oauth';
import {createAuthMiddleware} from './middlewares/authorization';
import {authorizationResolver} from './utils/authorization';

const nodekit = new NodeKit({configsPath: path.resolve(__dirname, './configs')});

const {appName, appEnv, appInstallation, appDevMode} = nodekit.config;
nodekit.ctx.log('AppConfig details', {
    appName,
    appEnv,
    appInstallation,
    appDevMode,
});

const {allowPasswordAuth} = nodekit.config;

if (allowPasswordAuth) {
    nodekit.config.appBeforeAuthMiddleware = [
        ...(nodekit.config.appBeforeAuthMiddleware || []),
        authorizationResolver(createOAuthAuthorizationResolver()),
        authorizationResolver(createYTAuthorizationResolver()),
    ];

    nodekit.config.appAuthHandler = createAuthMiddleware();
}

nodekit.config.adjustAppConfig?.(nodekit);

const app = new ExpressKit(nodekit, routes);
configureApp(app);

if (require.main === module) {
    app.run();
}

export default app;
