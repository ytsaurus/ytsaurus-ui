define([], () => {
    function isLinkExternal(url) {
        return url.startsWith('//') || url.startsWith('http');
    }

    return {
        isLinkExternal,
    };
});
