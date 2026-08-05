export type FlowStateTarget = 'all' | 'key_state' | 'partition_state' | 'external_key_state';

export type FlowStateNameInputMode = 'declared-only' | 'suggested' | 'free-form';

export type FlowKeyColumn = {
    name: string;
    type: string;
    expression?: string;
    required?: boolean;
};

export type FlowStateFiltersValue = {
    computationId?: string;
    partitionId?: string;
    keyValues: Record<string, string>;
    stateName?: string;
    target: FlowStateTarget;
    limit: number;
};

export type FlowStateAccessBody = {
    computation_id?: string;
    partition_id?: string;
    key?: unknown;
    name?: string;
    target?: FlowStateTarget;
};

export type FlowStateValidationErrorKey =
    | 'validation_empty-key-value'
    | 'validation_expects-integer'
    | 'validation_integer-out-of-range'
    | 'validation_expects-number'
    | 'validation_expects-boolean'
    | 'validation_fill-all-keys'
    | 'validation_key-target-mismatch'
    | 'validation_no-scope';

export type FlowStateValidationError = {
    errorKey: FlowStateValidationErrorKey;
    params?: Record<string, string>;
};

export type FlowAnnotatedInteger = {$type: 'int64' | 'uint64'; $value: string};

export type FlowReadStatesBody = FlowStateAccessBody & {limit?: number};
export type FlowDeleteStatesBody = FlowStateAccessBody & {force?: boolean; commit?: boolean};

export type FlowKeyStateRow = {
    computation_id: string;
    key: unknown;
    states: Record<string, unknown>;
};

export type FlowPartitionStateRow = {
    computation_id?: string;
    partition_id: string;
    states: Record<string, unknown>;
};

export type FlowReadStatesResponse = {
    key_states?: Array<FlowKeyStateRow>;
    partition_states?: Array<FlowPartitionStateRow>;
    external_key_states?: Array<FlowKeyStateRow>;
    joined_external_key_states?: Array<FlowKeyStateRow>;
    errors?: Array<string>;
};

export type FlowMatchedStatesBucket = {
    total: number;
    details?: Record<string, Record<string, number>>;
};

export type FlowDeleteStatesResponse = {
    committed?: boolean;
    matched_states?: {
        key_states?: FlowMatchedStatesBucket;
        partition_states?: FlowMatchedStatesBucket;
        external_key_states?: FlowMatchedStatesBucket;
    };
    errors?: Array<string>;
};

export type FlowRowDeleteOutcome = {
    rowId: string;
    response?: FlowDeleteStatesResponse;
    error?: unknown;
};

export type FlowStateResultSection =
    | 'key_state'
    | 'partition_state'
    | 'external_key_state'
    | 'joined_external_key_state';

export type FlowStateResultRow = {
    section: FlowStateResultSection;
    computationId?: string;
    partitionId?: string;
    key?: unknown;
    stateName: string;
    value: unknown;
};

export type FlowPipelineStateValue =
    | 'Unknown'
    | 'Stopped'
    | 'Paused'
    | 'Working'
    | 'Draining'
    | 'Pausing'
    | 'Completed';

export type FlowStateReadState = {
    revision: number;
    requestId: number;
    loadingRequestId?: number;
    response?: FlowReadStatesResponse;
    error?: unknown;
};

export type FlowStateReadEvent =
    | {type: 'filters-changed'; hasScope: boolean; requestId: number}
    | {type: 'load-started'; requestId: number}
    | {type: 'load-succeeded'; requestId: number; response: FlowReadStatesResponse}
    | {type: 'load-failed'; requestId: number; error: unknown};

export type FlowDeleteDialogSnapshot = {bodyKey: string; force: boolean};

export type FlowDeleteDialogState = {
    session: number;
    force: boolean;
    busy?: 'state' | 'preview' | 'delete';
    pipelineState?: FlowPipelineStateValue;
    preview?: Array<FlowRowDeleteOutcome>;
    previewSnapshot?: FlowDeleteDialogSnapshot;
    committed?: Array<FlowRowDeleteOutcome>;
    failed?: Array<FlowRowDeleteOutcome>;
    error?: unknown;
};

export type FlowDeleteDialogEvent =
    | {type: 'opened'; session: number}
    | {type: 'closed'; session: number}
    | {type: 'force-changed'; force: boolean}
    | {type: 'run-started'; commit: boolean}
    | {type: 'pipeline-state-loaded'; session: number; pipelineState: FlowPipelineStateValue}
    | {
          type: 'preview-loaded';
          session: number;
          outcomes: Array<FlowRowDeleteOutcome>;
          snapshot: FlowDeleteDialogSnapshot;
      }
    | {
          type: 'delete-finished';
          session: number;
          outcomes: Array<FlowRowDeleteOutcome>;
          expected: number;
      }
    | {type: 'request-failed'; session: number; error: unknown};

export type FlowPipelineSpecData = {spec?: unknown};

export type FlowGroupBySchema =
    | Array<FlowKeyColumn>
    | {$attributes?: Record<string, unknown>; $value?: Array<FlowKeyColumn>};

export type FlowYsonWrapped<T> = T | {$attributes?: Record<string, unknown>; $value?: T};

export type FlowStateJoinSpec = {
    key_schema_override?: FlowGroupBySchema;
    key_provider_streams?: FlowYsonWrapped<Array<string>>;
};

export type FlowExternalStateJoinerSpec = {
    join_on?: FlowYsonWrapped<FlowStateJoinSpec>;
    parameters?: unknown;
};

export type FlowStaticSpecComputation = {
    group_by_schema?: FlowGroupBySchema;
    external_state_managers?: Record<string, unknown>;
    external_state_joiners?: FlowYsonWrapped<
        Record<string, FlowYsonWrapped<FlowExternalStateJoinerSpec>>
    >;
    heavy_hitters?: unknown;
};

export type FlowStaticSpec = {
    computations?: Record<string, FlowStaticSpecComputation>;
};

export type FlowKeySchemaResolution = {
    keyColumns: Array<FlowKeyColumn>;
    allKeyColumns: Array<FlowKeyColumn>;
    overrideActive: boolean;
};

export type FlowRowKeySchema = {
    keyColumns: Array<FlowKeyColumn>;
    allKeyColumns: Array<FlowKeyColumn>;
    keySchemaStateName?: string;
};

export type FlowStateRowFilterField = 'target' | 'computation' | 'key' | 'stateName';
export type FlowStateStorageLocation = {path: string; cluster?: string};

export type FlowHeavyHitterEntry = {keyText: string; ratio: number; partitionId: string};
export type FlowHeavyHittersMessageData = {
    title: string;
    entries: Array<FlowHeavyHitterEntry>;
    unparsedEntries: Array<string>;
};
export type FlowHeavyHitterStateSeed = {
    keyValues?: Record<string, string>;
    partitionId?: string;
};

export type FlowStateCellHandlers = {
    getRowFilterUpdate: (
        row: FlowStateResultRow,
        field: FlowStateRowFilterField,
    ) => FlowStateFiltersValue | undefined;
    onFiltersChange: (next: FlowStateFiltersValue) => void;
    resolveStoragePath: (row: FlowStateResultRow) => FlowStateStorageLocation | undefined;
    resolveComputationLink: (computationId: string) => string;
};
