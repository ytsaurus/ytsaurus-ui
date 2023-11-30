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
import {homeIndex, homeRedirect} from './controllers/home';
import {handleClusterInfo} from './controllers/cluster-info';

import {clusterVersions} from './controllers/clusters';
import {tableColumnPresetGet, tableColumnPresetSave} from './controllers/table-column-preset';
import {ping} from './controllers/ping';
import {handleChangePassword, handleLogin} from './controllers/login';
import {getClusterPools} from './controllers/scheduling-pools';
import {markdownToHtmlHandler} from './controllers/markdown-to-html';
import {odinProxyApi} from './controllers/odin-proxy-api';
import {getClustersAvailability} from './controllers/availability';
import {chytProxyApi} from './controllers/chyt-api';
import {oauthCallback, oauthLogin, oauthLogout} from './controllers/oauth-login';
import {handleLogout} from './controllers/logout';

const HOME_INDEX_TARGET: AppRouteDescription = {handler: homeIndex, ui: true};

const routes: AppRoutes = {
    'GET /change-password/': HOME_INDEX_TARGET,
    'GET /': HOME_INDEX_TARGET,
    'GET /ping': {handler: ping, authPolicy: AuthPolicy.disabled},
    'GET /api/cluster-info/:cluster': {handler: handleClusterInfo},
    'GET /api/cluster-params/:cluster': {handler: clusterParams},
    'GET /api/clusters/versions': {handler: clusterVersions},
    'GET /api/pool-names/:cluster': {handler: getClusterPools},
    'POST /api/yt/login': {handler: handleLogin, ui: true},
    'GET /api/yt/logout': {handler: handleLogout, ui: true},

    'GET /oauth/login': {handler: oauthLogin, ui: true},
    'GET /api/oauth/callback': {handler: oauthCallback, ui: true},
    'GET /api/oauth/logout/callback': {handler: oauthLogout, ui: true},

    'POST /api/yt/change-password': {handler: handleChangePassword, ui: true},
    'POST /api/remote-copy': {handler: handleRemoteCopy},

    'POST /api/markdown-to-html': {handler: markdownToHtmlHandler},

    'GET  /api/yt/:cluster/api/:version/:command': {handler: ytTvmApiHandler},
    'POST /api/yt/:cluster/api/:version/:command': {handler: ytTvmApiHandler},
    'PUT  /api/yt/:cluster/api/:version/:command': {handler: ytTvmApiHandler},

    'GET /api/yt-proxy/:cluster/:command': {handler: ytProxyApi},

    'GET /api/odin/proxy/:action/:cluster?': {handler: odinProxyApi},
    'GET /api/odin/clusters/availability': {handler: getClustersAvailability},

    'POST /api/chyt/:cluster/:action': {handler: chytProxyApi},

    'GET    /api/settings/:username': {handler: settingsGet},
    'POST   /api/settings/:username': {handler: settingsCreate},
    'GET    /api/settings/:username/:path': {handler: settingsGetItem},
    'PUT    /api/settings/:username/:path': {handler: settingsSetItem},
    'DELETE /api/settings/:username/:path': {handler: settingsDeleteItem},

    'GET  /api/table-column-preset/:hash': {
        handler: tableColumnPresetGet,
    },
    'POST /api/table-column-preset': {handler: tableColumnPresetSave},

    'GET /:cluster/': HOME_INDEX_TARGET,
    'GET /:cluster/maintenance': {handler: homeRedirect},
    'GET /:cluster/:page': HOME_INDEX_TARGET,
    'GET /:cluster/:page/:tab': HOME_INDEX_TARGET,
    'GET /:cluster/:page/:operation/:tab': HOME_INDEX_TARGET,
    'GET /:cluster/:page/:operation/:job/:tab': HOME_INDEX_TARGET,
};

export default routes;
