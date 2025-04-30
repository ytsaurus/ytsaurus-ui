import React from 'react';
import cn from 'bem-cn-lite';
import {
    StickyContainer,
    StickyContainerProps,
} from '../../components/StickyContainer/StickyContainer';
import {HEADER_HEIGHT} from '../../constants/index';
import {TOOLBAR_COMPONENT_HEIGHT} from './Toolbar/Toolbar';

import './WithStickyToolbar.scss';

const block = cn('with-sticky-toolbar');

export const STICKY_TOOLBAR_BOTTOM = HEADER_HEIGHT + TOOLBAR_COMPONENT_HEIGHT;
export const STICKY_DOUBLE_TOOLBAR_BOTTOM = HEADER_HEIGHT + TOOLBAR_COMPONENT_HEIGHT * 2;

type Props = Omit<StickyContainerProps, 'children' | 'hideShadow' | 'keepWidth'> & {
    toolbar: React.ReactNode;
    content: React.ReactNode;
    doubleHeight?: boolean;
    padding?: 'skip-vertical' | 'skip-horizontal';
    bottomMargin?: 'regular';
    hideToolbarShadow?: boolean;
};

export default function WithStickyToolbar({
    className,
    doubleHeight,
    toolbar,
    content,
    padding,
    bottomMargin,
    hideToolbarShadow,
    ...rest
}: Props) {
    return (
        <StickyContainer
            {...rest}
            className={block({'bottom-margin': bottomMargin, x2: doubleHeight}, className)}
            hideShadow={hideToolbarShadow}
            sitkyPostion="fixed"
        >
            {({sticky, topStickyClassName}) => (
                <React.Fragment>
                    <div className={block('toolbar', {padding, sticky}, topStickyClassName)}>
                        {toolbar}
                    </div>
                    <div className={block('toolbar-spacer', {sticky})} />
                    {content}
                </React.Fragment>
            )}
        </StickyContainer>
    );
}
