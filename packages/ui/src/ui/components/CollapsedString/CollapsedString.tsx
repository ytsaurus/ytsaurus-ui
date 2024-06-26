import React, {FC, useMemo} from 'react';
import {useToggle} from 'react-use';
import cn from 'bem-cn-lite';

import './CollapsedString.scss';
import {ActiveText} from '../../components/ActiveText/ActiveText';

type Props = {
    value: string;
    limit?: number;
};

const block = cn('yt-collapsed-string');

export const CollapsedString: FC<Props> = ({value, limit = 200}) => {
    const [expanded, toggleExpanded] = useToggle(false);
    const hasToggle = value.length > limit;

    const text = useMemo(() => {
        return expanded || value.length <= limit ? value : value.slice(0, limit - 1) + '…';
    }, [expanded, limit, value]);

    return (
        <div className={block()}>
            {text}
            {hasToggle && (
                <ActiveText className={block('toggle')} onClick={toggleExpanded}>
                    {expanded ? 'Hide' : 'Show more'}
                </ActiveText>
            )}
        </div>
    );
};
