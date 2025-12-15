import {RootState} from '../../reducers';
import {getQueryDraft, getQueryEngine} from '../../selectors/query-tracker/query';
import {AGENT_MAP} from '../../../containers/AiChat/constants';
import {getPage} from '../../selectors/global';

const DEFAULT_AGENT = 'qt';

export type PageContext = {
    meta: {agent: string};
    contextMessages: string[];
};

const getQueriesPageContext = (state: RootState): PageContext => {
    const engine = getQueryEngine(state);
    const agent = engine ? AGENT_MAP[engine] : DEFAULT_AGENT;

    const draft = getQueryDraft(state);
    const contextMessages: string[] = [];

    if (draft.query && draft.query.trim()) {
        contextMessages.push(`<query>\n${draft.query}\n</query>`);
    }

    if (draft.error) {
        const errorText =
            typeof draft.error === 'string' ? draft.error : JSON.stringify(draft.error, null, 2);
        contextMessages.push(`<error>\n${errorText}\n</error>`);
    }

    return {
        meta: {agent},
        contextMessages,
    };
};

export const getContextByPage = (state: RootState): PageContext => {
    const page = getPage(state);

    if (page === 'Queries') {
        return getQueriesPageContext(state);
    }

    return {
        meta: {agent: DEFAULT_AGENT},
        contextMessages: [],
    };
};
