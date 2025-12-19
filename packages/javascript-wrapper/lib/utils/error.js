const error = {};

error.prepare = function (message) {
    return 'yt: ' + message;
};

error.requiredParameter = function (parameter) {
    const error = this;

    return error.prepare('Parameter ' + parameter + ' is required.');
};

module.exports = error;
