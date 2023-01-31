import * as React from 'react';
import cn from 'bem-cn-lite';

import {Freeze} from './Freeze';
import {StrictReactNode} from '../QueryResultsView/YQLTable/utils';

const block = cn('not-render-until-first-visible');

interface Props {
    hide?: boolean;
    className?: string;
    children: StrictReactNode;
}

export default function NotRenderUntilFirstVisible({hide, className, children}: Props) {
    const [frozen, setFrozen] = React.useState(Boolean(hide));

    React.useEffect(() => {
        const frameId = requestAnimationFrame(() => {
            setFrozen(Boolean(hide));
        });
        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [hide]);

    return (
        <div style={frozen ? {display: 'none'} : undefined} className={block(null, className)}>
            <Freeze freeze={frozen}>{children}</Freeze>
        </div>
    );
}
