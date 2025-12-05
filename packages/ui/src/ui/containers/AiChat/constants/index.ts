import {QueryEngine} from '../../../../shared/constants/engines';

export const PROMPT_MAP: Record<string, string> = {
    [QueryEngine.YQL]: 'yql_fix_qt',
    [QueryEngine.CHYT]: 'chyt_fix_qt',
    [QueryEngine.YT_QL]: 'yt_ql_fix_qt',
    [QueryEngine.SPYT]: 'spyt_fix_qt',
};

export const AGENT_MAP: Record<QueryEngine, string> = {
    [QueryEngine.YQL]: 'yql_qt',
    [QueryEngine.CHYT]: 'chyt_qt',
    [QueryEngine.YT_QL]: 'yt_ql_qt',
    [QueryEngine.SPYT]: 'spyt_qt',
};
