export function makeDashboardConfigSettingName(cluster: string) {
    return `local::${cluster}::dashboard::config` as const;
}
