var error = require('../utils/error.js');
var utils = require('./utils.js');

// Operations
var _operation = {};

_operation.configureStartedBy = function (commandSettings, parameters) {
    parameters.spec = parameters.spec || {};

    parameters.spec.started_by = {
        wrapper_version: 'JavaScript Wrapper',
        command: ['yt.' + commandSettings.version + '.' + commandSettings.command]
    };
};

module.exports = {
    // Transactions
    startTransaction: {
        name: 'start_tx',
        method: 'POST',
        dataType: 'json'
    },
    pingTransaction: {
        name: 'ping_tx',
        method: 'POST',
        dataType: 'text'
    },
    abortTransaction: {
        name: 'abort_tx',
        method: 'POST',
        dataType: 'text'
    },
    commitTransaction: {
        name: 'commit_tx',
        method: 'POST',
        dataType: 'text'
    },

    // Cypress
    move: {
        name: 'move',
        method: 'POST',
        dataType: 'text'
    },
    create: {
        name: 'create',
        method: 'POST',
        dataType: 'text'
    },
    set: {
        name: 'set',
        method: 'PUT',
        dataType: 'text'
    },
    get: {
        name: 'get',
        method: 'GET',
        dataType: 'json'
    },
    list: {
        name: 'list',
        method: 'GET',
        dataType: 'json'
    },
    exists: {
        name: 'exists',
        method: 'GET',
        dataType: 'json'
    },
    remove: {
        name: 'remove',
        method: 'POST',
        dataType: 'text'
    },
    copy: {
        name: 'copy',
        method: 'POST',
        dataType: 'text'
    },
    link: {
        name: 'link',
        method: 'POST',
        dataType: 'text'
    },
    lock: {
        name: 'lock',
        notImplemented: true
    },

    // Files
    upload: {
        name: 'upload',
        notImplemented: true
    },
    download: {
        name: 'download',
        method: 'GET',
        dataType: 'text',
        heavy: true,
        headers: {
            Accept: 'text/plain'
        },
        prepareParameters: function (parameters) {
            parameters['suppress_access_tracking'] = 'true';

            return parameters;
        }
    },
    concatenate: {
        name: 'concatenate',
        notImplemented: true
    },

    // Tables
    read: {
        name: 'read',
        method: 'GET',
        dataType: 'text',
        heavy: true,

        prepareParameters: function (parameters) {
            parameters['suppress_access_tracking'] = 'true';

            parameters['output_format'] = parameters['output_format'] || 'json';

            return parameters;
        }
    },
    write:  {
        name: 'write',
        method: 'PUT',
        dataType: 'text',
        headers: {
            'Content-Type': 'application/octet-stream'
        },
        heavy: true,
        prepareData: utils.prepareInputRows,
        prepareParameters: function (parameters) {
            parameters['input_format'] = parameters['input_format'] || 'json';

            return parameters;
        }
    },

    // Groups, User, ACL
    addMember: {
        name: 'add_member',
        method: 'POST',
        dataType: 'text'
    },
    checkPermission: {
        name: 'check_permission',
        method: 'GET',
        dataType: 'json'
    },
    removeMember: {
        name: 'remove_member',
        method: 'POST',
        dataType: 'text'
    },

    // Operations
    abortOperation: {
        name: 'abort_op',
        method: 'POST',
        dataType: 'text'
    },
    resumeOperation: {
        name: 'resume_op',
        method: 'POST',
        dataType: 'text'
    },
    suspendOperation: {
        name: 'suspend_op',
        method: 'POST',
        dataType: 'text'
    },
    map: {
        name: 'map',
        method: 'POST',
        dataType: 'text',
        prepareParameters: function (parameters) {
            if (typeof parameters.spec === 'undefined') {
                throw new Error(error.requiredParameter('spec'));
            }

            if (typeof parameters.spec.input_table_paths === 'undefined') {
                throw new Error(error.requiredParameter('spec.input_table_paths'));
            }

            if (typeof parameters.spec.output_table_paths === 'undefined') {
                throw new Error(error.requiredParameter('spec.output_table_paths'));
            }

            if (typeof (parameters.spec.mapper && parameters.spec.mapper.command) === 'undefined') {
                throw new Error(error.requiredParameter('spec.mapper.command'));
            }

            _operation.configureStartedBy(this, parameters);

            return parameters;
        }
    },
    erase: {
        name: 'erase',
        method: 'POST',
        dataType: 'text'
    },
    mapReduce: {
        name: 'map_reduce',
        notImplemented: true
    },
    merge: {
        name: 'merge',
        method: 'POST',
        dataType: 'text',
        prepareParameters: function (parameters) {
            if (typeof parameters.spec === 'undefined') {
                throw new Error(error.requiredParameter('spec'));
            }

            if (typeof parameters.spec.input_table_paths === 'undefined') {
                throw new Error(error.requiredParameter('spec.input_table_paths'));
            }

            if (typeof parameters.spec.output_table_path === 'undefined') {
                throw new Error(error.requiredParameter('spec.output_table_path'));
            }

            _operation.configureStartedBy(this, parameters);

            return parameters;
        }
    },
    reduce: {
        name: 'reduce',
        notImplemented: true
    },
    remoteCopy: {
        name: 'remote_copy',
        method: 'POST',
        dataType: 'text',
        prepareParameters: function (parameters) {
            if (typeof parameters.spec === 'undefined') {
                throw new Error(error.requiredParameter('spec'));
            }

            if (typeof parameters.spec.cluster_name === 'undefined') {
                throw new Error(error.requiredParameter('cluster_name'));
            }

            if (typeof parameters.spec.input_table_paths === 'undefined') {
                throw new Error(error.requiredParameter('spec.input_table_paths'));
            }

            if (typeof parameters.spec.output_table_path === 'undefined') {
                throw new Error(error.requiredParameter('spec.output_table_path'));
            }

            _operation.configureStartedBy(this, parameters);

            return parameters;
        }
    },
    sort: {
        name: 'sort',
        notImplemented: true
    },

    // Other
    parseYPath: {
        name: 'parse_ypath',
        notImplemented: true
    }
};
