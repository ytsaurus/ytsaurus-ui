import React, {FC} from 'react';
import {Markdown} from '../../../components/Markdown/Markdown';
import Link from '../../../components/Link/Link';

type Props = {
    annotation?: string;
    expanded: boolean;
    onToggle: () => void;
};

export const AnnotationWithPartial: FC<Props> = ({annotation, expanded, onToggle}) => {
    const value = annotation || '';

    const {isFullText, text} = React.useMemo(() => {
        const rows = value.split(/\n+/);
        return {
            text: rows.slice(0, 3).join('\n\n'),
            isFullText: rows.length <= 3,
        };
    }, [value]);

    return (
        <>
            <Markdown text={expanded ? value : text} />
            {isFullText ? null : (
                <Link theme={'ghost'} onClick={onToggle}>
                    {expanded ? 'Hide more' : 'Show more'}
                </Link>
            )}
        </>
    );
};
