import React, {Component} from 'react';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';
import _ from 'lodash';

import unipika from '../../common/thor/unipika';

import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import {UnipikaSettings, UnipikaValue} from './StructuredYson/StructuredYsonTypes';

import StructuredYsonVirtualized from './StructuredYsonVirtualized/StructuredYsonVirtualized';

export interface YsonProps {
    settings?: UnipikaSettings;
    value: any;
    inline?: boolean;
    folding?: boolean;
    children?: React.ReactNode;
    extraTools?: React.ReactNode;
    virtualized?: boolean;
    className?: string;
}

interface State {
    convertedValue: UnipikaValue;
    value: YsonProps['value'];
    settings: YsonProps['settings'];
}

const INITIAL = {};

export default class Yson extends Component<YsonProps, State> {
    static settingsProps = PropTypes.shape({
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

    static propTypes = {
        settings: Yson.settingsProps.isRequired,
        value: PropTypes.any,
        inline: PropTypes.bool,
        folding: PropTypes.bool,
        children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
        className: PropTypes.string,
    };

    static defaultUnipikaSettings = {
        asHTML: true,
        format: 'json',
        compact: false,
        escapeWhitespace: true,
        showDecoded: true,
        binaryAsHex: true,
    };

    static defaultProps = {
        inline: false,
        folding: false,
        settings: Yson.defaultUnipikaSettings,
    };

    static getDerivedStateFromProps(props: YsonProps, state: State) {
        const {value: prevValue, settings: prevSettings} = state;
        const {value, settings = {}} = props;

        if (
            prevValue === INITIAL ||
            !_.isEqual(prevValue, value) ||
            !_.isEqual(prevSettings, settings)
        ) {
            // TODO: fix me later
            // The call is required because unipika.format() applies default values to a passed settings inplace.
            // We have to leave this call without it the behaviour will be broken.
            if (settings.format === 'raw-json') {
                unipika.formatRaw(value, settings);
            } else {
                unipika.formatFromYSON(value, settings);
            }

            return {
                convertedValue:
                    value === undefined
                        ? ''
                        : settings!.format === 'raw-json'
                        ? unipika.converters.raw(value, settings)
                        : unipika.converters.yson(value, settings),
                value: value,
                settings: settings,
            };
        }
        return null;
    }

    state: State = {
        convertedValue: undefined as any, // getDerivedStateFromProps should provide correct vgitalue for this field
        value: INITIAL,
        settings: {format: ''},
    };

    getFormattedTitle() {
        const {inline} = this.props;
        if (!inline) {
            return undefined;
        }

        const {convertedValue, settings} = this.state;
        const titleSettings = Object.assign({}, settings, {asHTML: false});

        return unipika.format(convertedValue, titleSettings);
    }

    getFormattedValue() {
        const {convertedValue, settings} = this.state;
        return unipika.format(convertedValue, settings);
    }

    render() {
        const {inline, children, folding, extraTools, className} = this.props;
        const {convertedValue, settings} = this.state;

        const classes = block('unipika-wrapper')(
            {
                inline: inline && 'yes',
            },
            className,
        );

        return (
            <ErrorBoundary>
                {settings!.asHTML ? (
                    <div className={classes} title={this.getFormattedTitle()} dir="auto">
                        {folding ? (
                            <StructuredYsonVirtualized
                                value={convertedValue}
                                settings={settings!}
                                extraTools={extraTools}
                            />
                        ) : (
                            <pre
                                className="unipika"
                                dangerouslySetInnerHTML={{
                                    __html: this.getFormattedValue(),
                                }}
                            />
                        )}
                        {children}
                    </div>
                ) : (
                    <div
                        className={classes}
                        title={this.getFormattedTitle()}
                        dangerouslySetInnerHTML={{
                            __html: this.getFormattedValue(),
                        }}
                        dir="auto"
                    >
                        {children}
                    </div>
                )}
            </ErrorBoundary>
        );
    }
}
