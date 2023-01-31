import React from 'react';

import unipika from '../../common/thor/unipika';
import ypath from '../../common/thor/ypath';

function PathPart({name}: {name?: string}) {
    if (!name) {
        return null;
    }

    if (name === '/') {
        return <span>/</span>;
    }

    const fragment = ypath.YPath.fragmentToYSON(name);
    try {
        const __html = unipika.decode(fragment);
        return <span dangerouslySetInnerHTML={{__html}} />;
    } catch {
        return <span>{fragment}</span>;
    }
}

export const PathFragment = React.memo(PathPart);

function PathView({path, lastFragmentOnly}: {path?: string; lastFragmentOnly?: boolean}) {
    const items = React.useMemo(() => {
        if (!path) {
            return [];
        }

        const {fragments} = new ypath.YPath(path, 'absolute');
        return !lastFragmentOnly ? fragments : fragments.slice(-1);
    }, [path, lastFragmentOnly]);

    const res: Array<React.ReactNode> = [];
    for (let i = 0; i < items.length; ++i) {
        const {name} = items[i];
        res.push(<PathFragment key={i} name={name} />);
        if (i < items.length - 1) {
            res.push(<span key={'slash_' + i}>/</span>);
        }
    }
    return <>{res}</>;
}

export default PathView;
