import hammer from '../../../../../common/hammer';
import ypath from '../../../../../common/thor/ypath';
import _ from 'lodash';
import UIFactory from '../../../../../UIFactory';

const TASKS_PREFIX = 'tasks/';

function prepareFile(file) {
    return {
        path: ypath.getValue(file),
        originalPath: ypath.getValue(file, '/@original_path'),
        name: ypath.getValue(file, '/@file_name'),
        executable: ypath.getBoolean(file, '/@executable'),
    };
}

function prepareMeta(meta) {
    const prepared = _.map(meta, (value, name) => ({name, value}));

    return _.sortBy(prepared, 'name');
}

function prepareStartedBy(operation) {
    const startedBy = ypath.getValue(operation, '/@spec/started_by');
    const command = ypath.getValue(startedBy, '/command') || [];

    const fields = _.filter(prepareMeta(startedBy), (option) => option.name !== 'command');

    if (fields.length || command.length) {
        return {
            fields: fields,
            command: command,
        };
    }
}

function prepareRemote(operation) {
    if (operation.type === 'remote_copy') {
        return {
            cluster: ypath.getValue(operation, '/@spec/cluster_name'),
            network: ypath.getValue(operation, '/@spec/network_name'),
        };
    }
}

function prepareTransferTask(operation) {
    const task = ypath.getValue(operation, '/@spec/transfer_manager');

    if (task) {
        return {
            id: task.task_id,
            url: UIFactory.makeUrlForTransferTask(operation),
        };
    }
}

function prepareTransaction(operation, type, table, userTransactionAlive) {
    const tableTransaction = ypath.get(table, '/@transaction_id');

    if (tableTransaction) {
        return tableTransaction;
    } else if (operation.state === 'running') {
        return ypath.get(
            operation,
            `/@${type === 'stderr' ? 'debug_output' : type}_transaction_id`,
        );
    } else if (userTransactionAlive) {
        return ypath.get(operation, '/@user_transaction_id');
    }
}

function prepareLivePreviewPath(operation, type, index) {
    const id = operation.$value;
    const basePath = '//sys/operations/' + hammer.utils.extractFirstByte(id) + '/' + id;

    if (type === 'output') {
        return basePath + '/output_' + (index || 0);
    }
    if (type === 'stderr') {
        return basePath + '/stderr';
    } else if (type === 'intermediate') {
        return basePath + '/intermediate';
    }
}

function prepareLivePreview(operation, type, index) {
    const previewSupported = ypath.getBoolean(
        operation,
        '/@progress/live_preview/' + type + '_supported',
    );

    if (previewSupported && operation.isRunning()) {
        const path = prepareLivePreviewPath(operation, type, index);
        const transaction = ypath.getValue(operation, '/@async_scheduler_transaction_id');

        return {path, transaction, supported: true};
    }

    return {supported: false};
}

function normalizeTableRanges(table) {
    let ranges = ypath.getValue(table, '/@ranges');

    if (typeof ranges === 'undefined') {
        // Fallback attempt to get ranges from attributes
        // Exact range is only supported in updated ypath
        const upperLimit = ypath.getValue(table, '/@upper_limit');
        const lowerLimit = ypath.getValue(table, '/@lower_limit');

        let range;

        if (typeof upperLimit !== 'undefined') {
            range = range || {};
            range['upper_limit'] = upperLimit;
        }

        if (typeof lowerLimit !== 'undefined') {
            range = range || {};
            range['lower_limit'] = lowerLimit;
        }

        if (range) {
            ranges = [range];
        }

        if (range) {
            ranges = [range];
        }
    }

    return ranges;
}

function prepareTableFilters(table) {
    const ranges = normalizeTableRanges(table);
    const columns = ypath.getValue(table, '/@columns');
    let filters;

    if (ranges) {
        filters = filters || {};
        filters.ranges = ranges;
    }

    if (columns) {
        filters = filters || {};
        filters.columns = columns;
    }

    return filters;
}

function prepareTable(operation, type, table, typedTable, userTransactionAlive, index) {
    const path = ypath.getValue(table);
    const originalPath = ypath.getValue(table, '/@original_path');
    const transaction = prepareTransaction(operation, type, table, userTransactionAlive);

    return {
        path,
        originalPath,
        transaction,
        livePreview: prepareLivePreview(operation, type, index),
        append: ypath.getBoolean(table, '/@append'),
        teleport: ypath.getBoolean(table, '/@teleport'),
        primary: ypath.getBoolean(table, '/@primary'),
        foreign: ypath.getBoolean(table, '/@foreign'),
        filters: prepareTableFilters(table),
        typedFilters: prepareTableFilters(typedTable),
    };
}

function groupTables(tables) {
    const group = [];
    let currentFolder;

    _.each(tables, (table) => {
        try {
            const path = ypath.YPath.create(table.path, 'absolute');
            const name = path.getKey();
            const folder = path.toSubpath(-2).stringify();

            if (currentFolder !== folder) {
                currentFolder = folder;
                group.push({
                    path: folder,
                    transaction: table.transaction,
                    isFolder: true,
                });
            }

            group.push(Object.assign(table, {name: name}));
        } catch (err) {
            console.error('groupTables error', err);
        }
    });

    return group;
}

function prepareRemoteInput(input, cluster) {
    if (cluster) {
        return _.map(input, (item) => ({
            ...item,
            remote: true,
            url: remoteInputUrl(cluster, item.path, item.transaction),
        }));
    }

    return input;
}

export function remoteInputUrl(cluster, path, transaction) {
    return '/' + cluster + '/navigation?path=' + path + (transaction ? '&t=' + transaction : '');
}

function prepareInput(operation, userTransactionAlive) {
    const TYPE = 'input';
    let tables;

    switch (operation.type) {
        case 'remote_copy':
        case 'merge':
        case 'map':
        case 'reduce':
        case 'map_reduce':
        case 'sort':
        case 'join_reduce': {
            const typedTables = ypath.get(operation.$typedAttributes, '/spec/input_table_paths');

            tables = ypath.get(operation, '/@spec/input_table_paths');
            tables = _.map(tables, (table, index) =>
                prepareTable(operation, TYPE, table, typedTables[index], userTransactionAlive),
            );
            break;
        }
        case 'erase': {
            const typedTable = ypath.get(operation.$typedAttributes, '/spec/input_table_path');

            tables = ypath.get(operation, '/@spec/table_path');
            tables = tables && [
                prepareTable(operation, TYPE, tables, typedTable, userTransactionAlive),
            ];
            break;
        }
    }

    return groupTables(tables);
}

function prepareStderr(operation, userTransactionAlive) {
    const TYPE = 'stderr';
    const typedTables = ypath.get(operation.$typedAttributes, '/spec/input_table_paths');

    let tables = ypath.get(operation, '/@spec/stderr_table_path');
    tables = tables && [prepareTable(operation, TYPE, tables, typedTables, userTransactionAlive)];

    return groupTables(tables);
}

function prepareOutput(operation, userTransactionAlive) {
    const TYPE = 'output';
    let tables;

    switch (operation.type) {
        case 'map':
        case 'reduce':
        case 'map_reduce':
        case 'join_reduce': {
            const typedTables = ypath.get(operation.$typedAttributes, '/spec/input_table_paths');

            tables = ypath.get(operation, '/@spec/output_table_paths');
            tables = _.map(tables, (table, index) =>
                prepareTable(
                    operation,
                    TYPE,
                    table,
                    typedTables[index],
                    userTransactionAlive,
                    index,
                ),
            );
            break;
        }
        case 'merge': // These operations do not have output livePreview
        case 'sort':
        case 'remote_copy': {
            const typedTable = ypath.get(operation.$typedAttributes, '/spec/input_table_path');

            tables = ypath.get(operation, '/@spec/output_table_path');
            tables = tables && [
                prepareTable(operation, TYPE, tables, typedTable, userTransactionAlive),
            ];
            break;
        }
    }

    return groupTables(tables);
}

function prepareIntermediate(operation) {
    let livePreview;

    switch (operation.type) {
        case 'map_reduce':
        case 'sort':
            livePreview = prepareLivePreview(operation, 'intermediate');
            break;
    }

    if (livePreview && livePreview.supported) {
        return livePreview;
    }
}

function prepareScriptCaption(type) {
    return type.indexOf(TASKS_PREFIX) === 0 ? type.substring(TASKS_PREFIX.length) + '_task' : type;
}

function prepareScript(operation, type) {
    try {
        const script = ypath.getValue(operation, '/@spec/' + type);

        let environment = ypath.getValue(script, '/environment');
        environment = prepareMeta(environment);

        const command = ypath.getValue(script, '/command');
        const className = ypath.getValue(script, '/class_name');
        const jobCount = ypath.getValue(script, '/job_count');
        const files = _.map(ypath.getValue(script, '/file_paths'), prepareFile);

        if (command || className || jobCount || files?.length || environment?.length) {
            return {
                type: type,
                caption: prepareScriptCaption(type),
                command,
                className,
                jobCount,
                files,
                environment,
            };
        }
    } catch (err) {
        console.error('prepareScript error:', err);
    }
}

function prepareTasks(operation) {
    const tasks = ypath.getValue(operation, '/@spec/tasks');

    if (tasks) {
        return _.map(_.keys(tasks), (taskName) =>
            prepareScript(operation, TASKS_PREFIX + taskName),
        );
    }
}

export function prepareSpecification(operation, userTransactionAlive) {
    const specification = {};

    specification.startedBy = prepareStartedBy(operation);

    // Remote copy
    specification.remote = prepareRemote(operation);
    specification.transferTask = prepareTransferTask(operation);
    // Merge
    specification.mode = ypath.getValue(operation, '/@spec/mode');

    // Input/Intermediate/Output/Stderr
    specification.input = prepareRemoteInput(
        prepareInput(operation, userTransactionAlive),
        specification.remote?.cluster,
    );
    specification.output = prepareOutput(operation, userTransactionAlive);
    specification.stderr = prepareStderr(operation, userTransactionAlive);
    specification.intermediate = prepareIntermediate(operation);

    // Scripts
    specification.mapper = prepareScript(operation, 'mapper');
    specification.reducer = prepareScript(operation, 'reducer');
    specification.reduceCombiner = prepareScript(operation, 'reduce_combiner');

    specification.tasks = prepareTasks(operation);

    return specification;
}

export function prepareVisibleItems(items) {
    return _.filter(items, (item) => !item.isFolder);
}

export function filterVisibleItems(items, itemsCount) {
    const result = [];
    let count = 0;

    for (const item of items) {
        if (!item.isFolder) {
            count++;
        }
        if (count === itemsCount + 1) {
            break;
        }

        result.push(item);
    }

    return result;
}
