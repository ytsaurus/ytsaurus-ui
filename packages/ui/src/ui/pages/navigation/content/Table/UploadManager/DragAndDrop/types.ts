import {FORMATS} from './constants';

export type FileFormats = keyof typeof FORMATS;

export type ProgressState =
    | {inProgress: false}
    | {inProgress: true; event: {total?: number; loaded: number}};
