import type {Visualization} from '../types';
import {Result} from '../../module/query_result/types';

export type PrepareLineArgs = {
    result: QueryResult;
    visualization: Visualization;
};

export type QueryResult = Record<string, Result>[];
