export const getNavigationUrl = (cluster: string, path: string) => {
    const url = new URL(location.origin + location.pathname);
    url.searchParams.append('listMode', 'navigation');
    url.searchParams.append('navCluster', cluster);
    if (path && path !== '/') {
        url.searchParams.append('navPath', path);
    }

    return url.toString();
};
