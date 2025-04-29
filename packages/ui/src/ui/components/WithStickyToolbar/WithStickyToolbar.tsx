import React from 'react';
import cn from 'bem-cn-lite';
import {StickyContainer} from '../../components/StickyContainer/StickyContainer';
import {HEADER_HEIGHT} from '../../constants/index';
import {TOOLBAR_COMPONENT_HEIGHT} from './Toolbar/Toolbar';

import './WithStickyToolbar.scss';

const block = cn('with-sticky-toolbar');

export const STICKY_TOOLBAR_BOTTOM = HEADER_HEIGHT + TOOLBAR_COMPONENT_HEIGHT;
export const STICKY_DOUBLE_TOOLBAR_BOTTOM = HEADER_HEIGHT + TOOLBAR_COMPONENT_HEIGHT * 2;

interface Props {
    className?: string;
    toolbar: React.ReactNode;
    content: React.ReactNode;
    doubleHeight?: boolean;
    padding?: 'skip-vertical' | 'skip-horizontal';
    bottomMargin?: 'regular';
    hideToolbarShadow?: boolean;
}

export default function WithStickyToolbar({
    className,
    doubleHeight,
    toolbar,
    content,
    padding,
    bottomMargin,
    hideToolbarShadow,
}: Props) {
    return (
        <StickyContainer
            className={block({'bottom-margin': bottomMargin, x2: doubleHeight}, className)}
            hideShadow={hideToolbarShadow}
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
