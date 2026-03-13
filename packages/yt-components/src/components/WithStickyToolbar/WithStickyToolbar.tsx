import React from 'react';
import cn from 'bem-cn-lite';
import {StickyContainer, StickyContainerProps} from '../StickyContainer';

import './WithStickyToolbar.scss';

const block = cn('with-sticky-toolbar');

type Props = Omit<StickyContainerProps, 'children' | 'hideShadow' | 'keepWidth'> & {
    toolbar: React.ReactNode;
    toolbarClassName?: string;
    content: React.ReactNode | ((props: {sticky: boolean}) => React.ReactNode);
    doubleHeight?: boolean;
    padding?: 'skip-horizontal';
    bottomMargin?: 'regular';
    topMargin?: 'none';
    hideToolbarShadow?: boolean;
};

export function WithStickyToolbar({
    className,
    doubleHeight,
    toolbar,
    toolbarClassName,
    content,
    padding,
    bottomMargin,
    topMargin,
    hideToolbarShadow,
    ...rest
}: Props) {
    return (
        <StickyContainer
            {...rest}
            className={block(
                {'bottom-margin': bottomMargin, 'top-margin': topMargin, x2: doubleHeight},
                className,
            )}
            hideShadow={hideToolbarShadow}
            sitkyPostion="fixed"
        >
            {({stickyTop: sticky, stickyTopClassName}) => (
                <React.Fragment>
                    <div
                        className={block(
                            'toolbar',
                            {padding, sticky},
                            [stickyTopClassName, toolbarClassName].filter(Boolean).join(' '),
                        )}
                    >
                        {toolbar}
                    </div>
                    <div className={block('toolbar-spacer', {sticky})} />
                    {typeof content === 'function' ? content({sticky}) : content}
                </React.Fragment>
            )}
        </StickyContainer>
    );
}
