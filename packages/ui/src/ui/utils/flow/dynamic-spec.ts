import {type FlowDynamicSpecPatch} from '../../../shared/yt-types';
import ypath from '../../common/thor/ypath';
import unipika from '../../common/thor/unipika';

export function decodeDynamicSpecText(value: string): string {
    if (Array.from(value).some((char) => char.charCodeAt(0) > 0xff)) {
        return value;
    }
    try {
        return unipika.utils.utf8.decode(value);
    } catch {
        return value;
    }
}

export function dynamicSpecPatchDiff(patch: FlowDynamicSpecPatch): Record<string, unknown> {
    const diff: Record<string, unknown> = Object.create(null);
    for (const {path, value} of patch.changes) {
        const parts = ypath.YPath.parseRelative(path).map(({name}: {name: string}) =>
            ypath.YPath.fragmentToYSON(name),
        );
        let node = diff;
        for (const key of parts.slice(0, -1)) {
            node[key] = Object.assign(Object.create(null), node[key]);
            node = node[key] as Record<string, unknown>;
        }
        if (parts.length) node[parts[parts.length - 1]] = value;
    }
    return diff;
}
