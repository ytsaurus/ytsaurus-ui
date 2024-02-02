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

    reportBugUrl?: string;

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

    /**
     * chytMonitoring.urlTemplate supports following parameters:
     *   - {ytCluster}
     *   - {chytAlias}
     * All the parameters are optional and the are replaced with corresponding values
     * @example {
     *   urlTemplate: `https://my.monitoring.service/chyt?cluster={ytCluster}&alias={chytAlias}`
     * }
     */
    chytMonitoring?: UISettingsMonitoring;

    /**
     * Allows to define regular expression to extract hash-part from version of node by named group 'hash'
     * @example reHashFromNodeVersion: '[^~]+(?<hash>[^+]+)'
     */
    reHashFromNodeVersion?: string;

    /**
     * Allows to define regular expression to extract short-name from full address of host by named group 'shortname'.
     *  Also it supports optional named group 'suffix' that will pe appended to shortname as is.
     * @example reShortNameFromAddress: '(?<shortname>.*)((\\.msk\\.my-domain\\.ru)|(\\.vla\\.my-domain\\.net))'
     * @example reShortNameFromAddress: '(?<shortname>.*)((\\.msk\\.my-domain\\.ru)|(\\.vla\\.my-domain\\.net))'
     */
    reShortNameFromAddress?: string;

    /**
     * Allows to override behavior of `reShortNameFromAddress` for tablet/bundles/cells specific parts of UI.
     * @example reShortNameFromTabletNodeAddress: '(?<shortname>[^-]+-[^-]+).*'
     */
    reShortNameFromTabletNodeAddress?: string;

    /**
     * Allows to define array of regexps for allowed urls of TaggedType of unipika to display media-content (audio/video/images).
     * If there are no matched items in the array the TaggedType-item will be displayed as a json-object.
     * @expamle
     * reUnipikaAllowTaggedSources: [
     *   "https:\\/\\/image\\.bank\\.my\\/fruits\\/",
     *   "https:\\/\\/image\\.bank\\.my\\/vegetables\\/"
     * ]
     */
    reUnipikaAllowTaggedSources: Array<string>;

    /**
     * Allows to define service for removing 'Referer' header for url-s on a page.
     *
     * See `@gravity-ui/unipika v3.0.0` details in [CHANGELOG.md](https://github.com/gravity-ui/unipika/blob/main/CHANGELOG.md).
     */
    hideReferrerUrl?: string;
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
