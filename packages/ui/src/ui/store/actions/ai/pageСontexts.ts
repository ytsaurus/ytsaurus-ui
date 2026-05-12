import {type RootState} from '../../reducers';
import {selectQueryDraft} from '../../selectors/query-tracker/query';
import {selectPage} from '../../selectors/global';

export const DEFAULT_AGENT = 'qt';

export type PageContext = {
    meta: {agent: string};
    contextMessages: string[];
};

const getQueriesPageContext = (state: RootState): PageContext => {
    const draft = selectQueryDraft(state);
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
        meta: {agent: DEFAULT_AGENT},
        contextMessages,
    };
};

export const getContextByPage = (state: RootState): PageContext => {
    const page = selectPage(state);

    if (page === 'Queries') {
        return getQueriesPageContext(state);
    }

    return {
        meta: {agent: DEFAULT_AGENT},
        contextMessages: [],
    };
};
