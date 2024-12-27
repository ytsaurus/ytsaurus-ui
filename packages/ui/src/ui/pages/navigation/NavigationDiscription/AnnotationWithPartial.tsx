import React, {FC} from 'react';
import {Markdown} from '../../../components/Markdown/Markdown';
import {ClickableText} from '../../../components/ClickableText/ClickableText';

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
            <Markdown color={'complementary'} text={expanded ? value : text} />
            {isFullText ? null : (
                <ClickableText color={'secondary'} onClick={onToggle}>
                    {expanded ? 'Hide more' : 'Show more'}
                </ClickableText>
            )}
        </>
    );
};
