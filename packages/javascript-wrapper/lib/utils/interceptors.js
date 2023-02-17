var meta = require('./meta.js');

module.exports = function (axiosInstance) {
    axiosInstance.interceptors.request.use(function (config) {
        // Just for sure
        if (typeof config !== 'undefined') {
            meta.setTimingsOnRequestStart(config);
        }

        return config;
    }, function (error) {
        return Promise.reject(error);
    });

    axiosInstance.interceptors.response.use(function (response) {
        // Just for sure
        if (typeof response.config !== 'undefined') {
            meta.setTimingsOnRequestEnd(response.config, response);
        }

        return response;
    }, function (error) {
        // Cancelled requests reject without config, this includes timed out requests =(
        // TODO timing cancelled requests
        if (typeof error.config !== 'undefined') {
            meta.setTimingsOnRequestEnd(error.config, error.response);
        }

        return Promise.reject(error);
    });

    return axiosInstance;
};
