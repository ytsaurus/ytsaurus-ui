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
import axios from 'axios';

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

    'POST /gateway/:scope/:service/:action?': {
        handler: (req, res) => {
            axios
                .request({
                    method: 'POST',
                    url: 'https://datalens.yeee737-vm.ui.nebius.com' + req.url,
                    headers: {
                        'authority': req.headers['authority'],
                        'accept': req.headers['accept'],
                        'accept-language': req.headers['accept-language'],
                        'content-type': 'application/json',
                        'cookie': req.headers['cookie'],
                        'origin': req.headers['origin'], 
                        'referer': req.headers['referer'],
                        'sec-ch-ua': req.headers['sec-ch-ua'],
                        'sec-ch-ua-mobile': req.headers['sec-ch-ua-mobile'],
                        'sec-ch-ua-platform': req.headers['sec-ch-ua-platform'],
                        'sec-fetch-dest': req.headers['sec-fetch-dest'],
                        'sec-fetch-mode': req.headers['sec-fetch-mode'],
                        'sec-fetch-site': req.headers['sec-fetch-site'],
                        'user-agent': req.headers['user-agent'],
                        'x-dl-tenantid': req.headers['x-dl-tenantid'],
                        'x-request-id': req.headers['x-request-id'],
                        'x-timezone-offset': req.headers['x-timezone-offset']
                    },
                    data: JSON.stringify(req.body),
                })
                .then((result) => {
                    res.json(result.data).send();
                })
                .catch((e) => {
                    req.ctx.logError('error', e);
                    res.status(400).send();
                });
        },
    },
};

export default routes;
