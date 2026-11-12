import React, {type FC} from 'react';
import {ClickableText} from '../../../components/ClickableText/ClickableText';
import {Markdown} from '../../../components/Markdown/Markdown';
import i18n from './i18n';

type Props = {
    annotation: string;
    expanded: boolean;
    onToggle: () => void;
};

export const AnnotationWithPartial: FC<Props> = ({annotation, expanded, onToggle}) => {
    const value = annotation;

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
                <ClickableText color={'secondary'} onClick={onToggle}>
                    {expanded ? i18n('action_hide-more') : i18n('action_show-more')}
                </ClickableText>
            )}
        </>
    );
};
