import type {VcsItem, VcsLocation} from '@gravity-ui/querieskit/modules/QueriesVcs';
import type {VcsFileContext, VcsState} from '../../../../store/reducers/query-tracker/vcsSlice';
import {
    createVcsFileContext,
    joinVcsPath,
} from '../../../../store/actions/query-tracker/vcsHelpers';

export type QueriesVcsFile = VcsItem & {context?: VcsFileContext};

export function getVcsLocation(vcs: VcsState): VcsLocation {
    return {
        providerId: vcs.vcs,
        repositoryId: vcs.repository,
        branch: vcs.branch,
        path: '/' + vcs.path,
    };
}

export function getVcsBranches(branches: VcsState['branches']) {
    return branches.map((branch) =>
        typeof branch === 'string'
            ? {id: branch, title: branch}
            : {id: branch.value, title: branch.text},
    );
}

export function getVcsItems(vcs: VcsState): QueriesVcsFile[] {
    return Object.values(vcs.list)
        .filter((item) => item.name.includes(vcs.listFilter))
        .sort((a, b) => {
            if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
            return a.name.localeCompare(b.name, undefined, {sensitivity: 'base'});
        })
        .map((item) => {
            const path = joinVcsPath(vcs.path, item.name);
            const context = item.type === 'file' ? createVcsFileContext(vcs, path) : undefined;
            return {
                title: item.name,
                path: '/' + path,
                kind: item.type === 'directory' ? 'folder' : 'file',
                sourceUrl: context?.sourceUrl,
                disabled: Boolean(vcs.fileActionRequestId),
                context,
            };
        });
}
