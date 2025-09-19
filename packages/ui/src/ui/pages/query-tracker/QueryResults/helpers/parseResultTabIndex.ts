export const parseResultTabIndex = (tabId?: string) => {
    if (!tabId) {
        return undefined;
    }

    const parts = tabId.split('/');
    return parts?.[1] ? parseInt(parts?.[1], 10) : undefined;
};
