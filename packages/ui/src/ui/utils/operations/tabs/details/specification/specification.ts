import filter_ from 'lodash/filter';
import forEach_ from 'lodash/forEach';
import keys_ from 'lodash/keys';
import map_ from 'lodash/map';
import sortBy_ from 'lodash/sortBy';

import ypath from '../../../../../common/thor/ypath';
import UIFactory from '../../../../../UIFactory';
import type {
    DetailedOperationSelector,
    OperationPreviewType,
} from '../../../../../pages/operations/selectors';
import {genNavigationUrl} from '../../../../../utils/navigation/navigation';

const TASKS_PREFIX = 'tasks/';

function prepareFile(file: unknown) {
    return {
        path: ypath.getValue(file),
        originalPath: ypath.getValue(file, '/@original_path'),
        name: ypath.getValue(file, '/@file_name'),
        executable: ypath.getBoolean(file, '/@executable'),
    };
}

function prepareMeta(meta: Record<string, unknown>) {
    const prepared = map_(meta, (value, name) => ({name, value}));

    return sortBy_(prepared, 'name');
}

function prepareStartedBy(operation: DetailedOperationSelector) {
    const startedBy = ypath.getValue(operation, '/@spec/started_by');
    const command = ypath.getValue(startedBy, '/command') || [];

    const fields = filter_(prepareMeta(startedBy), (option) => option.name !== 'command');

    if (fields.length || command.length) {
        return {
            fields: fields,
            command: command,
        };
    }

    return undefined;
}

function prepareRemote(operation: DetailedOperationSelector) {
    if (operation.type === 'remote_copy') {
        return {
            cluster: ypath.getValue(operation, '/@spec/cluster_name'),
            network: ypath.getValue(operation, '/@spec/network_name'),
        };
    }
    return undefined;
}

function prepareTransferTask(operation: DetailedOperationSelector) {
    const task = ypath.getValue(operation, '/@spec/transfer_manager');

    if (task) {
        return {
            id: task.task_id,
            url: UIFactory.makeUrlForTransferTask(operation),
        };
    }
    return undefined;
}

function prepareTransaction(
    operation: DetailedOperationSelector,
    type: OperationPreviewType,
    table: unknown,
    userTransactionAlive: boolean,
) {
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
    return undefined;
}

function prepareLivePreview(
    operation: DetailedOperationSelector,
    type: OperationPreviewType,
    index?: number | string,
): {path?: string; supported: boolean; transaction?: string} {
    if (operation.isRunning()) {
        const {path, virtualPath} = operation.getLivePreviewPath(type, index);

        if (virtualPath) {
            return {path: virtualPath, supported: true};
        } else if (path) {
            const transaction = ypath.getValue(operation, '/@async_scheduler_transaction_id');
            return {path, transaction, supported: true};
        }
    }

    return {supported: false};
}

type RangeType = {upper_limit?: number; lower_limit?: number};

function normalizeTableRanges(table: unknown) {
    let ranges: Array<RangeType> = ypath.getValue(table, '/@ranges');

    if (typeof ranges === 'undefined') {
        // Fallback attempt to get ranges from attributes
        // Exact range is only supported in updated ypath
        const upperLimit = ypath.getValue(table, '/@upper_limit');
        const lowerLimit = ypath.getValue(table, '/@lower_limit');

        let range: RangeType | undefined;

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

function prepareTableFilters(table: unknown) {
    const ranges = normalizeTableRanges(table);
    const columns = ypath.getValue(table, '/@columns');
    let filters: {ranges?: typeof ranges; columns?: typeof columns} | undefined;

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

function prepareTable(
    operation: DetailedOperationSelector,
    type: OperationPreviewType,
    table: unknown,
    typedTable: unknown,
    userTransactionAlive: boolean,
    index?: number | string,
) {
    const path: string = ypath.getValue(table);
    const cluster: string | undefined = ypath.getValue(table, '/@cluster');
    const originalPath = ypath.getValue(table, '/@original_path');
    const transaction = prepareTransaction(operation, type, table, userTransactionAlive);

    return {
        path,
        ...(cluster ? {cluster} : {}),
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

function groupTables<T extends {path: string; transaction?: string; cluster?: string}>(
    tables: Array<T>,
) {
    const group: Array<{
        path: string;
        name?: string;
        isFolder?: boolean;
        transaction?: string;
        cluster?: string;
    }> = [];
    let currentGroup: string;

    forEach_(tables, (table) => {
        try {
            const {cluster} = table;
            const path = ypath.YPath.create(table.path, 'absolute');
            const name = path.getKey();
            const folder = path.toSubpath(-2).stringify();
            const groupKey: string = cluster ? `${cluster}:${folder}` : folder;

            if (currentGroup !== groupKey) {
                currentGroup = groupKey;
                group.push({
                    path: folder,
                    transaction: table.transaction,
                    isFolder: true,
                    ...(cluster ? {cluster} : {}),
                });
            }

            group.push(Object.assign(table, {name: name}));
        } catch (err) {
            console.error('groupTables error', err);
        }
    });

    return group;
}

function prepareRemoteInput<T extends {path: string; transaction?: string}>(
    input: Array<T>,
    cluster: string,
) {
    if (cluster) {
        return map_(input, (item) => ({
            ...item,
            remote: true,
            url: genNavigationUrl({cluster, ...item}),
        }));
    }

    return input;
}

export function remoteInputUrl(cluster: string, path: string, transaction?: string) {
    return '/' + cluster + '/navigation?path=' + path + (transaction ? '&t=' + transaction : '');
}

function prepareInput(operation: DetailedOperationSelector, userTransactionAlive: boolean) {
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
            tables = map_(tables, (table, index) =>
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

function prepareStderr(operation: DetailedOperationSelector, userTransactionAlive: boolean) {
    const TYPE = 'stderr';
    const typedTables = ypath.get(operation.$typedAttributes, '/spec/input_table_paths');

    let tables = ypath.get(operation, '/@spec/stderr_table_path');
    tables = tables && [prepareTable(operation, TYPE, tables, typedTables, userTransactionAlive)];

    return groupTables(tables);
}

function prepareCoredumps(operation: DetailedOperationSelector) {
    const coreTable = ypath.get(operation.$typedAttributes, '/spec/core_table_path');

    const tables = coreTable ? [prepareTable(operation, 'core', coreTable, [], false)] : [];
    return groupTables(tables);
}

function prepareOutput(operation: DetailedOperationSelector, userTransactionAlive: boolean) {
    const TYPE = 'output';
    let tables;

    switch (operation.type) {
        case 'map':
        case 'reduce':
        case 'map_reduce':
        case 'join_reduce': {
            const typedTables = ypath.get(operation.$typedAttributes, '/spec/input_table_paths');

            tables = ypath.get(operation, '/@spec/output_table_paths');
            tables = map_(tables, (table, index) =>
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

function prepareIntermediate(operation: DetailedOperationSelector) {
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

    return undefined;
}

function prepareScriptCaption(type: string) {
    return type.indexOf(TASKS_PREFIX) === 0 ? type.substring(TASKS_PREFIX.length) + '_task' : type;
}

function prepareScript(operation: DetailedOperationSelector, type: string) {
    try {
        const script = ypath.getValue(operation, '/@spec/' + type);

        let environment = ypath.getValue(script, '/environment');
        environment = prepareMeta(environment);

        const command = ypath.getValue(script, '/command');
        const className = ypath.getValue(script, '/class_name');
        const jobCount = ypath.getValue(script, '/job_count');
        const files = map_(ypath.getValue(script, '/file_paths'), prepareFile);

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

    return undefined;
}

function prepareTasks(operation: DetailedOperationSelector) {
    const tasks = ypath.getValue(operation, '/@spec/tasks');

    if (tasks) {
        return map_(keys_(tasks), (taskName) => prepareScript(operation, TASKS_PREFIX + taskName));
    }

    return undefined;
}

export function prepareSpecification(
    operation: DetailedOperationSelector,
    userTransactionAlive: boolean,
) {
    const remote = prepareRemote(operation);

    const specification = {
        startedBy: prepareStartedBy(operation),

        // Remote copy
        remote,
        transferTask: prepareTransferTask(operation),
        // Merge
        mode: ypath.getValue(operation, '/@spec/mode'),

        // Input/Intermediate/Output/Stderr
        input: prepareRemoteInput(prepareInput(operation, userTransactionAlive), remote?.cluster),
        output: prepareOutput(operation, userTransactionAlive),
        stderr: prepareStderr(operation, userTransactionAlive),
        intermediate: prepareIntermediate(operation),
        coredumps: prepareCoredumps(operation),

        // Scripts
        mapper: prepareScript(operation, 'mapper'),
        reducer: prepareScript(operation, 'reducer'),
        reduceCombiner: prepareScript(operation, 'reduce_combiner'),

        tasks: prepareTasks(operation),
    };

    return specification;
}

export function prepareVisibleItems<T extends {isFolder?: boolean}>(items: Array<T>) {
    return filter_(items, (item) => !item.isFolder);
}

export function filterVisibleItems<T extends {isFolder?: boolean}>(
    items: Array<T>,
    itemsCount: number,
) {
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
