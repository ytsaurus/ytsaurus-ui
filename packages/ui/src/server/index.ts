import path from 'path';
import {NodeKit} from '@gravity-ui/nodekit';
import {ExpressKit} from '@gravity-ui/expresskit';

import {configureApp} from './configure-app';

import {createYTAuthorizationResolver} from './middlewares/yt-auth';
import routes from './routes';
import {createOAuthAuthorizationResolver} from './middlewares/oauth';
import {createAuthMiddleware} from './middlewares/authorization';
import {authorizationResolver} from './utils/authorization';
import {createConfigurationErrorsMidleware} from './middlewares/check-configuration';

const nodekit = new NodeKit({configsPath: path.resolve(__dirname, './configs')});

const {appName, appEnv, appInstallation, appDevMode} = nodekit.config;
nodekit.ctx.log('AppConfig details', {
    appName,
    appEnv,
    appInstallation,
    appDevMode,
});

const {allowPasswordAuth, ytOAuthSettings} = nodekit.config;

const authMiddlewares = [];

if (ytOAuthSettings) {
    authMiddlewares.push(authorizationResolver(createOAuthAuthorizationResolver()));
}

if (allowPasswordAuth) {
    authMiddlewares.push(authorizationResolver(createYTAuthorizationResolver()));
}

if (authMiddlewares.length) {
    nodekit.config.appBeforeAuthMiddleware = [
        ...(nodekit.config.appBeforeAuthMiddleware || []),
        ...authMiddlewares,
    ];

    nodekit.config.appAuthHandler = createAuthMiddleware();
}

nodekit.config.adjustAppConfig?.(nodekit);

const configurationErrors = createConfigurationErrorsMidleware(nodekit);
if (configurationErrors) {
    nodekit.config.appBeforeAuthMiddleware = [configurationErrors];
}

const app = new ExpressKit(nodekit, routes);
configureApp(app);

if (require.main === module) {
    app.run();
}

export default app;
