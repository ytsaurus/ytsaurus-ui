import React, {type ReactNode, useMemo} from 'react';
import PropTypes from 'prop-types';

import type {RenderRowExtraTools} from '@gravity-ui/react-unipika';
import {ReactUnipika as ReactUnipikaWindowScroll} from '@gravity-ui/react-unipika/window-scroll';
import {ReactUnipika as ReactUnipikaContainerScroll} from '@gravity-ui/react-unipika/container-scroll';

import ErrorBoundary from '../../containers/ErrorBoundary/ErrorBoundary';
import {type UnipikaSettings} from './StructuredYson/StructuredYsonTypes';

export type YsonSettings = UnipikaSettings;

export type YsonProps = {
    settings?: YsonSettings;
    value: any;
    inline?: boolean;
    virtualized?: boolean;
    children?: ReactNode;
    extraTools?: ReactNode;
    className?: string;
    scrollContainer?: Element | null;
    toolbarStickyTop?: number;
    customLayout?: (params: {toolbar: ReactNode; content: ReactNode}) => ReactNode;
    renderRowExtraTools?: RenderRowExtraTools;
};

const defaultUnipikaSettings = {
    asHTML: true,
    format: 'json',
    compact: false,
    escapeWhitespace: true,
    showDecoded: true,
    binaryAsHex: true,
};

export const YsonSettingsPropTypes = PropTypes.shape({
    nonBreakingIndent: PropTypes.bool,
    escapeWhitespace: PropTypes.bool,
    escapeYQLStrings: PropTypes.bool,
    binaryAsHex: PropTypes.bool,
    showDecoded: PropTypes.bool,
    decodeUTF8: PropTypes.bool,
    format: PropTypes.string,
    indent: PropTypes.number,
    compact: PropTypes.bool,
    asHTML: PropTypes.bool,
    break: PropTypes.bool,
});

export const Yson = ({
    scrollContainer,
    settings = defaultUnipikaSettings,
    virtualized = false,
    ...rest
}: YsonProps) => {
    const scrollContainerRef = useMemo(
        () => (scrollContainer ? {current: scrollContainer} : undefined),
        [scrollContainer],
    );

    const content = scrollContainerRef ? (
        <ReactUnipikaContainerScroll
            {...rest}
            virtualized={virtualized}
            settings={settings}
            scrollContainerRef={scrollContainerRef}
        />
    ) : (
        <ReactUnipikaWindowScroll {...rest} virtualized={virtualized} settings={settings} />
    );

    return <ErrorBoundary>{content}</ErrorBoundary>;
};
