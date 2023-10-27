import ypath from '../../../../common/thor/ypath';

export interface YPathItem {
    action: number;
    name: string;
}

export function parseTablePath(text: string) {
    const parse =
        // new syntax
        /^(?:(?<cluster>\w+|`[^`]+`)\.\s*)?`(?<openingSlash>\/*)(?<tablePath>[^`]+)`(?::`?(?<view>[\w-]+)`?)?/.exec(
            text,
        ) ||
        // old syntax
        /^(?:(?<cluster>\w+|\[[^\]]+])\.\s*)?\[(?<openingSlash>\/*)(?<tablePath>[^\]]+)](?::\[?(?<view>[\w-]+)]?)?/.exec(
            text,
        ) ||
        // treat string '//string' or "//string" as table path
        /^(?<quote>['"])(?<openingSlash>\/\/)(?<tablePath>[^`]+)\k<quote>/.exec(text);
    const groups = parse?.groups;
    if (groups) {
        let cluster = groups.cluster;
        if (cluster && cluster.startsWith('`')) {
            cluster = cluster.replace(/`/g, '');
        }
        if (cluster && cluster.startsWith('[')) {
            cluster = cluster.replace(/[[\]]/g, '');
        }
        const extractedPath = groups.openingSlash + groups.tablePath;
        const parsedPath = parseRelativePath(extractedPath).filter(({name}) => Boolean(name));
        if (parsedPath.length === 0) {
            return null;
        }
        let path = parsedPath.map(({name}) => name).join('/');
        if (!path.startsWith('//')) {
            path = path.startsWith('/') ? '/' + path : '//' + path;
        }
        return {
            cluster: cluster,
            isPathAbsolute: Boolean(groups.openingSlash),
            path,
            view: groups.view,
        };
    } else {
        return null;
    }
}

export function parseRelativePath(path: string): YPathItem[] {
    try {
        return ypath.YPath.parseRelative(prepareYpathPath(path));
    } catch (error) {
        return [];
    }
}

export function prepareYpathPath(path: string) {
    if (path.startsWith('//')) {
        return path.slice(1);
    }

    return path.startsWith('/') || path.length === 0 ? path : `/${path}`;
}
