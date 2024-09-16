import {Action} from 'redux';
import type {OrderType} from '../utils/sort-helpers';

export type {YTError} from '../../@types/types.d';

export interface ActionD<T extends string, D> extends Action<T> {
    data: D;
}

export interface Acl {
    action: 'string';
    inheritance_mode: 'string';
    permissions: string[];
    subjects: string[];
}

export interface SortState<T = string> {
    column?: T;
    order?: OrderType;
}

export interface OldSortState<T = string> {
    field?: T;
    asc?: boolean;
    undefinedAsc?: boolean;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type FIX_MY_TYPE = any;

export type YTHealth = 'good' | 'failed' | 'initializing' | 'changing';

export type TypedKeys<T, P> = Exclude<
    {
        [K in keyof T]: T[K] extends P ? K : never;
    }[keyof T],
    undefined
>;

export type PartialDeep<T> = T extends string
    ? T
    : T extends number
      ? T
      : T extends boolean
        ? T
        : T extends undefined
          ? T
          : T extends null
            ? T
            : T extends Array<infer U>
              ? Array<PartialDeep<U>>
              : {[K in keyof T]?: PartialDeep<T[K]>};

export type ArrayElement<T> = T extends Array<infer U> ? U : never;

export type ValueOf<T> = T[keyof T];
