import React from 'react';

import {ResizeObserverContainer} from '../../../../../components/ResizeObserverContainer/ResizeObserverContainer';
import WithStickyToolbar from '../../../../../components/WithStickyToolbar/WithStickyToolbar';
import {TOOLBAR_COMPONENT_HEIGHT} from '../../../../../components/WithStickyToolbar/Toolbar/Toolbar';

import {SchedulingMeta} from './SchedulingMeta';
import {SchedulingToolbar} from './SchedulingToolbar';
import {SchedulingTable} from './SchedulingTable/SchedulingTable';

export function Overview({aboveContentHeight = 0}: {aboveContentHeight?: number}) {
    return (
        <ResizeObserverContainer observeContent={<SchedulingMeta />}>
            {({height = 0}) => (
                <WithStickyToolbar
                    toolbar={<SchedulingToolbar />}
                    content={
                        <SchedulingTable
                            aboveContentHeight={
                                aboveContentHeight + height + TOOLBAR_COMPONENT_HEIGHT + 10
                            }
                        />
                    }
                    topMargin="none"
                />
            )}
        </ResizeObserverContainer>
    );
}
