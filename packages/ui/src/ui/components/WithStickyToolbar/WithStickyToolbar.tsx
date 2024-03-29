import React from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
// @ts-ignore
import {Sticky, StickyContainer} from 'react-sticky';
import {HEADER_HEIGHT} from '../../constants/index';
import {TOOLBAR_COMPONENT_HEIGHT} from './Toolbar/Toolbar';

import './WithStickyToolbar.scss';

const block = cn('with-sticky-toolbar');

export const STICKY_TOOLBAR_BOTTOM = HEADER_HEIGHT + TOOLBAR_COMPONENT_HEIGHT + 5;
export const STICKY_DOUBLE_TOOLBAR_BOTTOM = HEADER_HEIGHT + TOOLBAR_COMPONENT_HEIGHT * 2 + 5;

const SPACER_STYLE = {
    height: TOOLBAR_COMPONENT_HEIGHT,
};

const SPACER_STYLE_X2 = {
    height: TOOLBAR_COMPONENT_HEIGHT * 2,
};

WithStickyToolbar.propTypes = {
    className: PropTypes.string,

    content: PropTypes.node,
    toolbar: PropTypes.node,
};

const ToolbarWrapper = React.memo(ToolbarWrapperImpl);

interface Props {
    className?: string;
    toolbar: React.ReactNode;
    content: React.ReactNode;
    doubleHeight?: boolean;
    disableToolbarTopPadding?: boolean;
}

const StickySpacerMemo = React.memo(StickySpacer);

export default function WithStickyToolbar({
    className,
    toolbar,
    content,
    doubleHeight,
    disableToolbarTopPadding,
}: Props) {
    return (
        <StickyContainer className={block(null, className)}>
            <Sticky topOffset={-HEADER_HEIGHT} disableCompensation>
                {({isSticky}: {isSticky: boolean}) => (
                    <div>
                        <ToolbarWrapper
                            isSticky={isSticky}
                            toolbar={toolbar}
                            doubleHeight={doubleHeight}
                            disableTopPadding={disableToolbarTopPadding}
                        />
                        {isSticky && <StickySpacerMemo doubleHeight={doubleHeight} />}
                    </div>
                )}
            </Sticky>
            {content}
        </StickyContainer>
    );
}

function StickySpacer({doubleHeight}: {doubleHeight?: boolean}) {
    return <div style={doubleHeight ? SPACER_STYLE_X2 : SPACER_STYLE} />;
}

interface ToolbarWrapperProps {
    isSticky?: boolean;
    toolbar: React.ReactNode;
    doubleHeight?: boolean;
    disableTopPadding?: boolean;
}

function ToolbarWrapperImpl(props: ToolbarWrapperProps) {
    const {isSticky, toolbar, doubleHeight, disableTopPadding} = props;
    return (
        <React.Fragment>
            <div
                className={block('toolbar', {
                    sticky: isSticky,
                    x2: doubleHeight,
                    'disable-top-padding': disableTopPadding,
                })}
            >
                {toolbar}
            </div>
            <div
                className={block('toolbar-spacer', {
                    sticky: isSticky,
                    x2: doubleHeight,
                })}
            />
        </React.Fragment>
    );
}
