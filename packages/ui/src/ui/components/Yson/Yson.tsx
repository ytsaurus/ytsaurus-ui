import React, {type ReactNode, useMemo} from 'react';
import PropTypes from 'prop-types';

import type {RenderRowExtraTools} from '@gravity-ui/react-unipika';
import {ReactUnipika as ReactUnipikaWindowScroll} from '@gravity-ui/react-unipika/window-scroll';
import {ReactUnipika as ReactUnipikaContainerScroll} from '@gravity-ui/react-unipika/container-scroll';

import ErrorBoundary from '../../containers/ErrorBoundary/ErrorBoundary';
import {YTErrorInline} from '../../containers/YTErrorInline/YTErrorInline';
import {type UnipikaSettings} from './StructuredYson/StructuredYsonTypes';
import i18n from './i18n';

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

function renderError(error: unknown) {
    return (
        <YTErrorInline
            error={error instanceof Error ? error : new Error(String(error))}
            hint={i18n('context_disable-utf8-decoding')}
        />
    );
}

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
            renderError={renderError}
        />
    ) : (
        <ReactUnipikaWindowScroll
            {...rest}
            virtualized={virtualized}
            settings={settings}
            renderError={renderError}
        />
    );

    return <ErrorBoundary>{content}</ErrorBoundary>;
};
