function setMeta(config, meta) {
    config.meta = config.meta || {};

    config.meta = Object.assign(config.meta, meta);
}

function getMeta(config) {
    return config.meta || {};
}

function setTimingsOnRequestStart(config) {
    setMeta(config, {
        requestStartTime: Date.now(),
    });
}

function setTimingsOnRequestEnd(config, response) {
    const meta = getMeta(config);
    const headers = (response && response.headers) || {};

    setMeta(config, {
        requestTime: Date.now() - meta.requestStartTime,
        requestId: headers['x-yt-request-id'],
        proxy: headers['x-yt-proxy'],
        contentLength: headers['content-length'],
    });
}

module.exports = {
    set: setMeta,
    get: getMeta,
    setTimingsOnRequestStart: setTimingsOnRequestStart,
    setTimingsOnRequestEnd: setTimingsOnRequestEnd,
};
