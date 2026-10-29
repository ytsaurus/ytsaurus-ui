import React, {useEffect, useState} from 'react';
import {CircleQuestion} from '@gravity-ui/icons';
import {Icon, Tooltip} from '@gravity-ui/uikit';
import {type QueriesVcsProps, type VcsLocation} from '@gravity-ui/querieskit/modules/QueriesVcs';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {selectVcs} from '../../../../store/selectors/query-tracker/vcs';
import {
    addFileToQuery,
    changeCurrentBranch,
    changeCurrentRepository,
    getContentByPath,
    getRepositoryContent,
    getVcsRepositories,
    getVcsTokensAvailability,
    insertFileToQuery,
    openFilePreview,
    setLastVcs,
} from '../../../../store/actions/query-tracker/vcs';
import {setListFilter, setPreview} from '../../../../store/reducers/query-tracker/vcsSlice';
import {type QueriesVcsFile, getVcsBranches, getVcsItems, getVcsLocation} from './adapters';
import i18n from '../VcsHeader/i18n';

export function useQueriesVcsProps({active}: {active: boolean}): QueriesVcsProps<QueriesVcsFile> {
    const dispatch = useDispatch();
    const [tokenHelpOpen, setTokenHelpOpen] = useState(false);
    const vcs = useSelector(selectVcs);
    useEffect(() => {
        if (!active) {
            setTokenHelpOpen(false);
            return;
        }
        dispatch(getVcsTokensAvailability());
        dispatch(setLastVcs());
    }, [active, dispatch]);

    const location = getVcsLocation(vcs);
    const context = vcs.preview.context;
    const onUpdate = (next: VcsLocation) => {
        if (next.providerId !== vcs.vcs) dispatch(getVcsRepositories(next.providerId));
        else if (next.repositoryId && next.repositoryId !== vcs.repository) {
            dispatch(changeCurrentRepository(next.repositoryId));
        } else if (next.branch && next.branch !== vcs.branch)
            dispatch(changeCurrentBranch(next.branch));
        else dispatch(getRepositoryContent(next.path));
    };

    return {
        location,
        onUpdate,
        providers: {
            items: (vcs.vcsConfig || []).map(({id, name, auth, hasToken}) => ({
                id,
                title:
                    name + (auth !== 'none' && !hasToken ? ` ${i18n('value_no-api-token')}` : ''),
            })),
        },
        repositories: {
            items: Object.entries(vcs.repositories).map(([id, repository]) => ({
                id,
                title: repository.name,
            })),
            ...vcs.requests.repositories,
        },
        branches: {items: getVcsBranches(vcs.branches), ...vcs.requests.branches},
        items: getVcsItems(vcs),
        search: {value: vcs.listFilter, onUpdate: (value) => dispatch(setListFilter(value))},
        listState: vcs.requests.list,
        onPathSubmit: (next) => dispatch(getContentByPath(next.path)),
        detail: {
            openedFile: context
                ? {
                      item: {
                          title: context.name,
                          path: '/' + context.path,
                          kind: 'file',
                          sourceUrl: context.sourceUrl,
                          disabled:
                              Boolean(vcs.fileActionRequestId) ||
                              vcs.requests.preview.loading ||
                              vcs.requests.preview.error,
                          context,
                      },
                      location: {
                          providerId: context.providerId,
                          repositoryId: context.repositoryId,
                          branch: context.branch,
                          path: '/' + context.directory,
                      },
                  }
                : undefined,
            content: vcs.preview.content,
            language: 'plaintext',
            loading: vcs.requests.preview.loading,
            error: vcs.requests.preview.error,
            onOpen: ({item}) => {
                if (item.context) dispatch(openFilePreview(item.context));
            },
            onClose: () => dispatch(setPreview({name: '', content: ''})),
        },
        onInsertFile: ({item}) => {
            if (item.context) dispatch(insertFileToQuery(item.context));
        },
        onAttachFile: ({item}) => {
            if (item.context) dispatch(addFileToQuery(item.context));
        },
        header: {
            actions: [
                {
                    id: 'token-help',
                    title: i18n('context_vcs-token-hint'),
                    content: (
                        <Tooltip
                            content={i18n('context_vcs-token-hint')}
                            open={active && tokenHelpOpen}
                            onOpenChange={setTokenHelpOpen}
                        >
                            <Icon data={CircleQuestion} size={16} />
                        </Tooltip>
                    ),
                    onClick: () => setTokenHelpOpen((open) => !open),
                },
            ],
        },
    };
}
