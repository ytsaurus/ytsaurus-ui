export interface ClusterUiConfig {
    enable_per_bundle_tablet_accounting?: boolean;
    enable_per_account_tablet_accounting?: boolean;
    per_bundle_accounting_help_link?: string;
    enable_maintenance_api_nodes?: boolean;
    enable_maintenance_api_proxies?: boolean;
}

export const defaultClusterUiConfig: Partial<ClusterUiConfig> = {};
