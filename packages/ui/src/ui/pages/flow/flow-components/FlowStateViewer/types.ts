import type React from 'react';

import type {
    FlowDeleteStatesResponse,
    FlowKeyColumn,
    FlowReadStatesResponse,
    FlowStateTarget,
    FlowStaticSpec,
} from '../../../../../shared/yt-types';

export type FlowStateNameInputMode = 'declared-only' | 'suggested' | 'free-form';

export type FlowStateFiltersValue = {
    computationId?: string;
    partitionId?: string;
    keyValues: Record<string, string>;
    stateName?: string;
    target: FlowStateTarget;
};

export type FlowStateReadResult = {
    filters: FlowStateFiltersValue;
    setFilters: React.Dispatch<React.SetStateAction<FlowStateFiltersValue>>;
    staticSpec: FlowStaticSpec | undefined;
    hasScope: boolean;
    validationError: string | undefined;
    response: FlowReadStatesResponse | undefined;
    initialLoading: boolean;
    refreshing: boolean;
    readSucceeded: boolean;
    error: unknown;
    refetch: () => void;
};

export type FlowStateValidationErrorKey =
    | 'validation_empty-key-value'
    | 'validation_expects-integer'
    | 'validation_integer-out-of-range'
    | 'validation_expects-number'
    | 'validation_expects-boolean'
    | 'validation_fill-all-keys'
    | 'validation_invalid-key-syntax'
    | 'validation_key-arity'
    | 'validation_key-target-mismatch'
    | 'validation_no-scope';

export type FlowStateValidationError = {
    errorKey: FlowStateValidationErrorKey;
    params?: Record<string, string>;
};

export type FlowStateAccessValidationError = Omit<FlowStateValidationError, 'errorKey'> & {
    errorKey: Exclude<
        FlowStateValidationErrorKey,
        'validation_invalid-key-syntax' | 'validation_key-arity'
    >;
};

export type FlowRowDeleteOutcome = {
    rowId: string;
    response?: FlowDeleteStatesResponse;
    error?: unknown;
};

export type FlowStateResultSection =
    'key_state' | 'partition_state' | 'external_key_state' | 'joined_external_key_state';

export type FlowStateResultRow = {
    section: FlowStateResultSection;
    computationId?: string;
    partitionId?: string;
    key?: unknown;
    stateName: string;
    value: unknown;
};

export type FlowDeleteDialogSnapshot = {bodyKey: string; force: boolean};

export type FlowDeleteDialogState = {
    session: number;
    force: boolean;
    busy?: 'preview' | 'delete';
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
    isRowFilterActive: (row: FlowStateResultRow, field: FlowStateRowFilterField) => boolean;
    onFiltersChange: (next: FlowStateFiltersValue) => void;
    resolveStoragePath: (row: FlowStateResultRow) => FlowStateStorageLocation | undefined;
    resolveComputationLink: (computationId: string) => string;
};
