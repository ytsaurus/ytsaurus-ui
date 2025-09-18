import {AppConfig} from '@gravity-ui/nodekit';

const {ALLOW_PASSWORD_AUTH, WITH_AUTH, YT_AUTH_CLUSTER_ID, YT_AUTH_ALLOW_INSECURE} = process.env;

const allowPasswordAuth = Boolean(ALLOW_PASSWORD_AUTH || WITH_AUTH || YT_AUTH_CLUSTER_ID);

console.log({allowPasswordAuth});

export const ytAuthConfigFromEnv: Partial<AppConfig> = {
    allowPasswordAuth,
    ytAuthAllowInsecure: Boolean(YT_AUTH_ALLOW_INSECURE),
};
