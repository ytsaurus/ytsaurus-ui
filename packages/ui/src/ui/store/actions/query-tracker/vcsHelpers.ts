import type {VcsFileContext, VcsState} from '../../reducers/query-tracker/vcsSlice';

export const normalizeVcsPath = (path: string) => path.replace(/^\/+|\/+$/g, '');
export const joinVcsPath = (directory: string, name: string) =>
    [normalizeVcsPath(directory), name].filter(Boolean).join('/');

export function createVcsFileContext(vcs: VcsState, rawPath: string): VcsFileContext | undefined {
    const {vcs: providerId, repository: repositoryId, repositories, branch} = vcs;
    if (!providerId || !repositoryId || !repositories[repositoryId] || !branch) return undefined;
    const path = normalizeVcsPath(rawPath);
    const separator = path.lastIndexOf('/');
    const directory = separator < 0 ? '' : path.slice(0, separator);
    const name = path.slice(separator + 1);
    const repository = repositories[repositoryId];
    const item = directory === vcs.path ? vcs.list[name] : undefined;
    let sourceUrl = item?.url;
    if (item && 'webUrl' in repository) sourceUrl = repository.webUrl + item.url;
    return {
        providerId,
        repositoryId,
        repository,
        branch,
        path,
        directory,
        name,
        sourceUrl,
    };
}
