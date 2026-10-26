import React, {type PropsWithChildren, useState} from 'react';
import {Drawer} from '@gravity-ui/uikit';
import useWindowSize from 'react-use/lib/useWindowSize';
import cn from 'bem-cn-lite';

import i18n from '../EventsSidePanel/i18n';

import './EventsSidePanelDrawer.scss';

const block = cn('yt-events-side-panel-drawer');

const DEFAULT_WIDTH = 560;
const MIN_WIDTH = 320;
const MAX_WIDTH = 800;

type Props = PropsWithChildren<{
    open: boolean;
    onClose: () => void;
}>;

export function EventsSidePanelDrawer({open, onClose, children}: Props) {
    const [width, setWidth] = useState(DEFAULT_WIDTH);
    const {width: viewportWidth} = useWindowSize();
    const maxWidth = Math.min(MAX_WIDTH, viewportWidth);

    return (
        <Drawer
            className={block()}
            qa="jobs-timeline-overlay"
            aria-label={i18n('title_job-details')}
            open={open}
            placement="right"
            resizable
            size={Math.min(width, maxWidth)}
            minSize={Math.min(MIN_WIDTH, maxWidth)}
            maxSize={maxWidth}
            onResizeEnd={setWidth}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) onClose();
            }}
            hideVeil
            disableModal
            disableOutsideClick
            disableBodyScrollLock
            contentOverflow="auto"
        >
            {children}
        </Drawer>
    );
}
