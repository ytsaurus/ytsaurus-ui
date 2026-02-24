import {YTPermissionType} from './yt-types';

export type YTErrorBlockTabs = Record<'attributes' | 'details' | 'stderrs', unknown>;

export type YTErrorKnownAttributes = {
    tablet_id?: string | number;
    user?: string;
    permission?: Array<YTPermissionType>;
} & YTErrorBlockTabs;

export type YTError<
    AttributesT extends {attributes?: object} = {attributes?: YTErrorKnownAttributes},
> = {
    message: string;
    code?: number;
    inner_errors?: Array<YTError<AttributesT>>;
    yt_javascript_wrapper?: {xYTTraceId?: string; xYTRequestId?: string};
} & AttributesT;
