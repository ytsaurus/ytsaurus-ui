import _ from 'lodash';
// TODO: get rid of the import, the file should not import UIFactory
import UIFactory from '../UIFactory';

import {getConfigData, uiSettings} from './ui-settings';

export function hasOdinPage() {
    return getConfigData().odinPageEnabled;
}
export function getSettingsDataFromInitialConfig() {
    return getConfigData().settings;
}

export function ytApiUseCORS() {
    return getConfigData().ytApiUseCORS;
}
export function isIdmAclAvailable() {
    return UIFactory.getAclApi().isAllowed;
}

export function getAccessLogBasePath() {
    return uiSettings.accessLogBasePath;
}

export function getAccountsUsageBasePath() {
    return uiSettings.accountsUsageBasePath;
}

export function getJupyterBasePath() {
    return uiSettings.jupyterBasePath;
}

export function isDocsAllowed() {
    return Boolean(uiSettings.docsBaseUrl);
}

export function docsUrl<T, K = string>(url: T, alt?: K) {
    return isDocsAllowed() ? url : alt ?? '';
}

export function getDocsBaseUrl() {
    return uiSettings.docsBaseUrl;
}

export function getNewTableReplicasCount() {
    return uiSettings.newTableReplicasCount || 3;
}

export function getQueryTrackerStage() {
    return uiSettings.queryTrackerStage;
}

export function getQueryTrackerCluster() {
    return uiSettings.queryTrackerCluster;
}

export function getConfigUploadTable() {
    return {
        uploadTableMaxSize: uiSettings.uploadTableMaxSize ?? 1024 * 1024 * 1024,
        uploadTableUseLocalmode: uiSettings.uploadTableUseLocalmode,
        uploadTableExcelBaseUrl: uiSettings.uploadTableExcelBaseUrl,
    };
}

export function allowDirectDownload() {
    return uiSettings.directDownload;
}

export function createAdminReqTicketUrl(params: Record<string, string> = {}) {
    const {trackerBaseUrl, trackerAdminRequestQueue: queue} = uiSettings;
    return createTrackerUrl(trackerBaseUrl, queue, params);
}

export function createQuotaReqTicketUrl(params: Record<string, string> = {}) {
    const {trackerBaseUrl, trackerQuoteRequestQueue: queue} = uiSettings;
    return createTrackerUrl(trackerBaseUrl, queue, params);
}

function createTrackerUrl(
    trackerBaseUrl?: string,
    queue?: string,
    params: Record<string, string> = {},
) {
    if (!queue || !trackerBaseUrl) {
        return {};
    }

    const search = new URLSearchParams(Object.assign(params, {queue})).toString();
    const url = `${trackerBaseUrl}/createTicket?${search}`;
    return {url, queue};
}
