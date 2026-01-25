import path from 'path';
import {NodeKit} from '@gravity-ui/nodekit';
import {ExpressKit} from '@gravity-ui/expresskit';

import {configureApp} from './configure-app';

import {createYTAuthorizationResolver} from './middlewares/yt-auth';
import routes from './routes';
import {createOAuthAuthorizationResolver} from './middlewares/oauth';
import {createAuthMiddleware} from './middlewares/authorization';
import {authorizationResolver} from './utils/authorization';
import {applyAppEnvToConfig} from './utils/configs/apply-app-env-to-config';
import {createConfigurationErrorsMidleware} from './middlewares/check-configuration';

const nodekit = new NodeKit({configsPath: path.resolve(__dirname, './configs')});
applyAppEnvToConfig(nodekit.config);

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

/**
 * In some cases requests to unkonwn hosts might be failed with `Error: getaddrinfo EAI_AGAIN`,
 * such requests do not fail immedeately they wait for timeout before falling, and during the timeout
 * all other requests to valid hosts from nodejs are falling too.
 * Steps to reproduce:
 * 1. Run UI without the fix
 *  `./run_local_cluster.sh --yt-version dev --docker-hostname $(hostname) --fqdn localhost --ui-version 1.33.0`
 * 2. Run api/clusters/versions:
 *  `curl http://$(hostname):8001/api/clusters/versions &`
 * 3. Do not wait while request from item 2 is finished and run:
 *  `curl http://$(hostname):8001/api/cluster-info/ui`
 *   (in some rare cases it might be successfully finished)
 
 * The solution is taken from https://stackoverflow.com/questions/40182121/whats-the-cause-of-the-error-getaddrinfo-eai-again
 */

/**
 * In specific cases it may bring unneccessary exceptions with ESERVFAIL
 * see https://github.com/szmarczak/cacheable-lookup/issues/68
 * see also https://nda.ya.ru/t/GzZa7MD97SrcUW
 
import http from 'http';
import https from 'https';
import CacheableLookup from 'cacheable-lookup';

const cacheable = new CacheableLookup();

cacheable.install(http.globalAgent);
cacheable.install(https.globalAgent);
*/
