import type {Visualization} from '../types';

export type PrepareLineArgs = {
    result: QueryResult;
    visualization: Visualization;
};

export type FieldObject = {
    $type: string;
    $value: unknown;
    $rawValue: string;
};

export type QueryResult = Record<string, FieldObject>[];
