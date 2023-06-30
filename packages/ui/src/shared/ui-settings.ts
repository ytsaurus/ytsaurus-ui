export interface UISettings {
    accessLogBasePath?: string;
    accountsUsageBasePath?: string;
    docsBaseUrl?: string;
    jupyterBasePath?: string;

    newTableReplicasCount: number;

    uploadTableMaxSize: number;
    uploadTableUseLocalmode?: boolean;

    uploadTableExcelBaseUrl?: string;
    exportTableBaseUrl?: string;

    directDownload?: boolean;

    trackerBaseUrl?: string;
    trackerQuoteRequestQueue?: string;
    trackerAdminRequestQueue?: string;

    datalensBaseUrl?: string;
    datalensAllowedCluster?: Array<string>;

    announcesMailListUrl?: string;

    sslCertFixUrl?: string;
    queryTrackerStage?: string;
    queryTrackerCluster?: string;

    oauthTokenUrl?: string;

    defaultFontType?: keyof Required<UISettings>['fontTypes'];

    fontTypes?: Record<string, {regular: string; monospace: string}>;

    /**
     * schedulingMonitoring.urlTemplate supports following parameters: {ytCluster}, {ytPool}, {ytPoolTree}.
     * All the parameters are optional and they are replaced with corresponding values.
     * @example {urlTemplate: 'https://my.monitoring.service/scheduling?cluster={ytCluster}&pool={ytPool}&poolTree={ytPoolTree}'}
     */
    schedulingMonitoring?: UISettingsMonitoring;

    /**
     * accountsMonitoring.urlTemplate supports following parameters: {ytCluster}, {ytAccount}
     * All the parameters are optional and they are replaced with corresponding values.
     * @example {urlTemplate: 'https://my.monitoring.service/accounts?cluster={ytCluster}&account={ytAccount}'}
     */
    accountsMonitoring?: UISettingsMonitoring;

    /**
     * bundlesMonitoring.urlTemplate supports following parameters: {ytCluster}, {ytTabletCellBundle}
     * All the parameters are optional and they are replaced with corresponding values.
     * @example {urlTemplate: 'https://my.monitoring.service/bundles?cluster={ytCluster}&account={ytTabletCellBundle}'}
     */
    bundlesMonitoring?: UISettingsMonitoring;

    /**
     * operationsMonitoring.urlTemplate supports following parameters:
     *  {ytCluster}, {ytOperationId}, {ytPool}, {ytPoolTree}, {ytSlotIndex}, {fromTimeMs}, {toTimeMs}
     * All the parameters are optional and they are replaced with corresponding values.
     * @example {
     *   urlTemplate:
     *     'https://my.monitoring.service/operations?cluster={ytCluster}&operationId={ytOperationId}&pool={ytPool}&tree={ytPoolTree}&slot={ytSlotIndex}&from={fromTimeMs}&to={toTimeMs}'
     * }
     */
    operationsMonitoring?: UISettingsMonitoring;
}

export interface UISettingsMonitoring {
    urlTemplate: string;
    title?: string;
}

export const uiSettingFromEnv: Partial<UISettings> = {
    uploadTableExcelBaseUrl: process.env.YTFRONT_UPLOAD_EXCEL_BASE_URL,
    exportTableBaseUrl: process.env.YTFRONT_EXPORT_EXCEL_BASE_URL,
    jupyterBasePath: process.env.YTFRONT_JUPYTER_BASE_URL,
};
