import React from 'react';

import {HEADER_HEIGHT} from '../../constants';
import {useScrollableElementContext} from '../../hooks/use-scrollable-element';

import {Yson, type YsonProps} from './Yson';

type Props = Omit<YsonProps, 'scrollContainer' | 'toolbarStickyTop' | 'virtualized'>;

export const YsonWithScroll = (props: Props) => {
    const scrollContainer = useScrollableElementContext();
    const toolbarStickyTop = scrollContainer ? 0 : HEADER_HEIGHT;

    return (
        <Yson
            {...props}
            virtualized
            scrollContainer={scrollContainer}
            toolbarStickyTop={toolbarStickyTop}
        />
    );
};
