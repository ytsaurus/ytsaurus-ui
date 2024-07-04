import {AppRouteDescription, AppRoutes, AuthPolicy} from '@gravity-ui/expresskit';
import {clusterParams} from './controllers/cluster-params';
import {ytTvmApiHandler} from './controllers/yt-api';
import {handleRemoteCopy} from './controllers/remote-copy';
import {ytProxyApi} from './controllers/yt-proxy-api';
import {
    settingsCreate,
    settingsDeleteItem,
    settingsGet,
    settingsGetItem,
    settingsSetItem,
} from './controllers/settings';
import {homeIndexFactory, homeRedirect} from './controllers/home';
import {handleClusterInfo} from './controllers/cluster-info';

import {clusterAuthStatus, clusterVersions} from './controllers/clusters';
import {tableColumnPresetGet, tableColumnPresetSave} from './controllers/table-column-preset';
import {ping} from './controllers/ping';
import {handleChangePassword, handleLogin} from './controllers/login';
import {getClusterPools} from './controllers/scheduling-pools';
import {markdownToHtmlHandler} from './controllers/markdown-to-html';
import {odinProxyApi} from './controllers/odin-proxy-api';
import {getClustersAvailability} from './controllers/availability';
import {strawberryProxyApi} from './controllers/strawberry-api';
import {oauthCallback, oauthLogin, oauthLogout} from './controllers/oauth-login';
import {handleLogout} from './controllers/logout';

const HOME_INDEX_TARGET: AppRouteDescription = {handler: homeIndexFactory(), ui: true};

const routes: AppRoutes = {
    'GET /:ytAuthCluster/change-password/': HOME_INDEX_TARGET,
    'GET /': HOME_INDEX_TARGET,
    'GET /ping': {handler: ping, authPolicy: AuthPolicy.disabled},
    'GET /api/cluster-info/:ytAuthCluster': {handler: handleClusterInfo},
    'GET /api/cluster-params/:ytAuthCluster': {handler: clusterParams},
    'GET /api/clusters/versions': {handler: clusterVersions},
    'GET /api/clusters/auth-status': {handler: clusterAuthStatus},
    'GET /api/pool-names/:ytAuthCluster': {handler: getClusterPools},
    'POST /api/yt/:ytAuthCluster/login': {handler: handleLogin, ui: true},
    'GET /api/yt/logout': {handler: handleLogout, ui: true},

    'GET /oauth/login': {handler: oauthLogin, ui: true},
    'GET /api/oauth/callback': {handler: oauthCallback, ui: true},
    'GET /api/oauth/logout/callback': {handler: oauthLogout, ui: true},

    'POST /api/yt/:ytAuthCluster/change-password': {handler: handleChangePassword, ui: true},
    'POST /api/remote-copy': {handler: handleRemoteCopy},

    'POST /api/markdown-to-html': {handler: markdownToHtmlHandler},

    'GET  /api/yt/:ytAuthCluster/api/:version/:command': {handler: ytTvmApiHandler},
    'POST /api/yt/:ytAuthCluster/api/:version/:command': {handler: ytTvmApiHandler},
    'PUT  /api/yt/:ytAuthCluster/api/:version/:command': {handler: ytTvmApiHandler},

    'GET /api/yt-proxy/:ytAuthCluster/:command': {handler: ytProxyApi},

    'GET /api/odin/proxy/:action/:ytAuthCluster?': {handler: odinProxyApi},
    'GET /api/odin/clusters/availability': {handler: getClustersAvailability},

    'POST /api/strawberry/:engine/:ytAuthCluster/:action': {handler: strawberryProxyApi},

    'GET    /api/settings/:ytAuthCluster/:username': {handler: settingsGet},
    'POST   /api/settings/:ytAuthCluster/:username': {handler: settingsCreate},
    'GET    /api/settings/:ytAuthCluster/:username/:path': {handler: settingsGetItem},
    'PUT    /api/settings/:ytAuthCluster/:username/:path': {handler: settingsSetItem},
    'DELETE /api/settings/:ytAuthCluster/:username/:path': {handler: settingsDeleteItem},

    'GET  /api/table-column-preset/:ytAuthCluster/:hash': {
        handler: tableColumnPresetGet,
    },
    'POST /api/table-column-preset/:ytAuthCluster': {handler: tableColumnPresetSave},

    'GET /:ytAuthCluster/': HOME_INDEX_TARGET,
    'GET /:ytAuthCluster/maintenance': {handler: homeRedirect},
    'GET /:ytAuthCluster/:page': HOME_INDEX_TARGET,
    'GET /:ytAuthCluster/:page/:tab': HOME_INDEX_TARGET,
    'GET /:ytAuthCluster/:page/:operation/:tab': HOME_INDEX_TARGET,
    'GET /:ytAuthCluster/:page/:operation/:job/:tab': HOME_INDEX_TARGET,
};

export default routes;
