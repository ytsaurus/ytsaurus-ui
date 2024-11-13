var error = require('../utils/error.js');
var setup = require('../utils/setup.js');
var utils = require('./utils.js');
var v2 = require('./v2');

var prepareSuppressAccessTracking = function (parameters, localSetup) {
    parameters = parameters || {};

    if (setup.getOption(localSetup, 'suppressAccessTracking')) {
        parameters['suppress_access_tracking'] = 'true';
    }

    return parameters;
};

module.exports = {
    // Transactions
    startTransaction: v2.startTransaction,
    pingTransaction: v2.pingTransaction,
    abortTransaction: v2.abortTransaction,
    commitTransaction: v2.commitTransaction,

    // Cypress
    move: v2.move,
    create: v2.create,
    remove: v2.remove,
    copy: v2.copy,
    link: v2.link,
    set: v2.set,
    lock: {
        name: 'lock',
        method: 'POST',
        dataType: 'json',
    },
    get: {
        name: 'get',
        method: 'GET',
        dataType: 'json',
        prepareParameters: prepareSuppressAccessTracking,
    },
    list: {
        name: 'list',
        method: 'GET',
        dataType: 'json',
        prepareParameters: prepareSuppressAccessTracking,
    },
    exists: {
        name: 'exists',
        method: 'GET',
        dataType: 'json',
        prepareParameters: prepareSuppressAccessTracking,
    },

    // Files
    download: {
        name: 'download',
        deprecated: true,
    },
    readFile: {
        name: 'read_file',
        method: 'GET',
        dataType: 'text',
        heavy: true,
        headers: {
            Accept: 'text/plain',
        },
        prepareParameters: prepareSuppressAccessTracking,
    },
    upload: {
        name: 'upload',
        deprecated: true,
    },
    writeFile: {
        name: 'write_file',
        notImplemented: true,
    },

    // Tables
    read: {
        name: 'read',
        deprecated: true,
    },
    readTable: {
        name: 'read_table',
        method: 'POST',
        dataType: 'text',
        version: 'v3',
        heavy: true,
        prepareParameters: function (parameters, localSetup) {
            parameters['output_format'] = parameters['output_format'] || 'json';

            return prepareSuppressAccessTracking(parameters, localSetup);
        },
        useBodyForParameters: true,
    },
    write: {
        name: 'write',
        deprecated: true,
    },
    writeTable: {
        name: 'write_table',
        method: 'PUT',
        dataType: 'text',
        version: 'v3',
        headers: {
            'Content-Type': 'application/octet-stream',
        },
        heavy: true,
        bigUpload: true,
        prepareData: utils.prepareWriteTableData,
        prepareParameters: function (parameters) {
            parameters['input_format'] = parameters['input_format'] || 'json';

            return parameters;
        },
    },
    selectRows: {
        name: 'select_rows',
        method: 'POST',
        dataType: 'text',
        heavy: true,
        prepareParameters: function (parameters, localSetup) {
            parameters = parameters || {};

            parameters['output_format'] = parameters['output_format'] || {
                $value: 'json',
                $attributes: {
                    string_length_limit: 1024,
                    encode_utf8: 'true',
                    stringify: 'true',
                    annotate_with_types: 'true',
                },
            };

            return prepareSuppressAccessTracking(parameters, localSetup);
        },
        useBodyForParameters: true,
    },
    mountTable: {
        name: 'mount_table',
        method: 'POST',
        dataType: 'text',
    },
    unmountTable: {
        name: 'unmount_table',
        method: 'POST',
        dataType: 'text',
    },
    remountTable: {
        name: 'remount_table',
        method: 'POST',
        dataType: 'text',
    },
    alterTable: {
        name: 'alter_table',
        method: 'POST',
        dataType: 'text',
    },
    insertRows: {
        name: 'insert_rows',
        method: 'PUT',
        dataType: 'text',
        headers: {
            'Content-Type': 'application/octet-stream',
        },
        heavy: true,
        prepareData: utils.prepareInputRows,
        prepareParameters: function (parameters) {
            parameters = parameters || {};

            parameters['input_format'] = parameters['input_format'] || {
                $value: 'json',
                $attributes: {
                    string_length_limit: 1024,
                    encode_utf8: 'true',
                    stringify: 'true',
                    annotate_with_types: 'true',
                },
            };

            return parameters;
        },
    },
    alterTableReplica: {
        name: 'alter_table_replica',
        method: 'POST',
        dataType: 'text',
    },

    // Journal
    readJournal: {
        name: 'read_journal',
        notImplemented: true,
    },
    writeJournal: {
        name: 'write_journal',
        notImplemented: true,
    },

    // Groups, Users, ACL
    addMember: v2.addMember,
    removeMember: v2.removeMember,
    checkPermission: {
        ...v2.checkPermission,
        method: 'POST',
        useBodyForParameters: true,
    },

    // Operations and Jobs
    abortOperation: v2.abortOperation,
    resumeOperation: v2.resumeOperation,
    suspendOperation: v2.suspendOperation,
    completeOperation: {
        name: 'complete_op',
        method: 'POST',
        dataType: 'text',
    },
    updateOperationParameters: {
        name: 'update_op_parameters',
        method: 'POST',
        dataType: 'text',
        prepareParameters: function (parameters) {
            parameters = parameters || {};
            if (typeof parameters._parameters === 'undefined') {
                throw new Error(error.requiredParameter('_parameters'));
            } else {
                // TODO: as of now we cannot use 'parameters' keyword because it's treated in a apecial way in
                // core._initCommand. We need to fix core._initCommand first to use parameters/data/setup with
                // underscores.
                parameters.parameters = parameters._parameters;
                delete parameters._parameters;
            }

            if (typeof parameters.operation_id === 'undefined') {
                throw new Error(error.requiredParameter('operation_id'));
            }

            return parameters;
        },
    },
    map: v2.map,
    reduce: v2.reduce,
    mapReduce: v2.mapReduce,
    joinReduce: {
        name: 'join_reduce',
        notImplemented: true,
    },
    erase: v2.erase,
    merge: {
        ...v2.merge,
        useBodyForParameters: true,
    },
    sort: {
        name: 'sort',
        method: 'POST',
        dataType: 'text',
    },
    remoteCopy: v2.remoteCopy,
    _listOperations: {
        name: '_list_operations',
        method: 'GET',
        dataType: 'json',
    },
    _getOperation: {
        name: '_get_operation',
        method: 'GET',
        dataType: 'json',
    },
    listOperations: {
        name: 'list_operations',
        method: 'GET',
        dataType: 'json',
    },
    getOperation: {
        name: 'get_operation',
        method: 'GET',
        dataType: 'json',
    },
    listJobs: {
        name: 'list_jobs',
        method: 'GET',
        dataType: 'json',
    },
    getJob: {
        name: 'get_job',
        method: 'GET',
        dataType: 'json',
    },
    straceJob: {
        name: 'strace_job',
        method: 'GET',
        dataType: 'json',
    },
    dumpJobContext: {
        name: 'dump_job_context',
        method: 'POST',
        dataType: 'text',
    },
    getJobInputPaths: {
        name: 'get_job_input_paths',
        method: 'GET',
        dataType: 'json',
    },
    signalJob: {
        name: 'signal_job',
        method: 'GET',
        dataType: 'text',
    },
    abandonJob: {
        name: 'abandon_job',
        method: 'GET',
        dataType: 'text',
    },
    abortJob: {
        name: 'abort_job',
        method: 'GET',
        dataType: 'text',
    },

    // Other
    parseYPath: v2.parseYPath,
    executeBatch: {
        name: 'execute_batch',
        method: 'POST',
        dataType: 'json',
        useBodyForParameters: true,
    },
    _discoverVersions: {
        name: '_discover_versions',
        method: 'GET',
        dataType: 'json',
    },

    getSupportedFeatures: {
        name: 'get_supported_features',
        method: 'GET',
        dataType: 'json',
    },
};
