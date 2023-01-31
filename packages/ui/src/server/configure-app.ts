import {ExpressKit} from '@gravity-ui/expresskit';

import {rememberApp} from './ServerFactory';

export function configureApp(app: ExpressKit) {
    rememberApp(app);

    if (app.config.appDevMode) {
        const sourceMaps = require('source-map-support');
        sourceMaps.install();
    }

    // Log YT response times for all requests
    const yt = require('@ytsaurus/javascript-wrapper')();
    interface IConfig {
        meta: any;
    }
    yt.subscribe('requestEnd', (config: IConfig) => {
        app.nodekit.ctx.log('yt-javascript-wrapper request completed', config.meta);
    });
}
