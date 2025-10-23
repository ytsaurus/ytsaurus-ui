import {AuthPolicy} from '@gravity-ui/expresskit';
import {AppConfig, YTCoreConfig} from '../../../@types/core';
import {applyMissingFields} from './apply-missing-fields';

function applyEnvToUISettings(config: Partial<YTCoreConfig>) {
    if (!config.uiSettings) {
        Object.assign(config, {uiSettings: {}});
    }

    const tmp: Partial<(typeof config)['uiSettings']> = {
        uploadTableExcelBaseUrl: process.env.YTFRONT_UPLOAD_EXCEL_BASE_URL,
        exportTableBaseUrl: process.env.YTFRONT_EXPORT_EXCEL_BASE_URL,
        jupyterBasePath: process.env.YTFRONT_JUPYTER_BASE_URL,
        grafanaBaseUrl: process.env.GRAFANA_BASE_URL,
        docsBaseUrl: process.env.YT_DOCS_BASE_URL || 'https://ytsaurus.tech/docs/en',
    };

    applyMissingFields(config.uiSettings, tmp);
}

function applyEnvToConfig(config: Partial<YTCoreConfig>) {
    const tmp: Partial<typeof config> = {
        prometheusBaseUrl: process.env.PROMETHEUS_BASE_URL,
    };

    applyMissingFields(config, tmp);
}

function applyAppAuthEnvToConfig(config: Partial<YTCoreConfig>) {
    const {ALLOW_PASSWORD_AUTH, WITH_AUTH, YT_AUTH_CLUSTER_ID, YT_AUTH_ALLOW_INSECURE} =
        process.env;
    const allowPasswordAuth = Boolean(ALLOW_PASSWORD_AUTH || WITH_AUTH || YT_AUTH_CLUSTER_ID);

    const tmp: Partial<typeof config> = {
        allowPasswordAuth,
        ytAuthAllowInsecure: Boolean(YT_AUTH_ALLOW_INSECURE),
        ...{appAuthPolicy: allowPasswordAuth ? AuthPolicy.required : AuthPolicy.disabled},
    };

    applyMissingFields(config, tmp);
}

export function applyAppEnvToConfig(config: Partial<AppConfig>) {
    applyEnvToUISettings(config);
    applyEnvToConfig(config);
    applyAppAuthEnvToConfig(config);

    return config;
}
