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
}

export const uiSettingFromEnv: Partial<UISettings> = {
    uploadTableExcelBaseUrl: process.env.YTFRONT_UPLOAD_EXCEL_BASE_URL,
    exportTableBaseUrl: process.env.YTFRONT_EXPORT_EXCEL_BASE_URL,
    jupyterBasePath: process.env.YTFRONT_JUPYTER_BASE_URL,
};
