import React, {Component} from 'react';
import block from 'bem-cn-lite';
import isEqual_ from 'lodash/isEqual';
import unipika from '../../utils/unipika';
import {ConfigurableErrorBoundary, useUnipikaSettings} from '../../context';
import {UnipikaSettings, UnipikaValue} from './StructuredYson/StructuredYsonTypes';

export interface YsonProps {
    settings?: UnipikaSettings;
    value: any;
    inline?: boolean;
    folding?: boolean;
    children?: React.ReactNode;
    className?: string;
}

interface State {
    convertedValue: UnipikaValue;
    value: YsonProps['value'];
    settings: YsonProps['settings'];
}

const INITIAL = {};

export const YSON_DEFAULT_UNIPIKA_SETTINGS: UnipikaSettings = {
    asHTML: true,
    format: 'json',
    compact: false,
    escapeWhitespace: true,
    showDecoded: true,
    binaryAsHex: true,
};

class YsonImpl extends Component<YsonProps, State> {
    static defaultProps = {
        inline: false,
        folding: false,
        settings: YSON_DEFAULT_UNIPIKA_SETTINGS,
    };

    static getDerivedStateFromProps(props: YsonProps, state: State) {
        const {value: prevValue, settings: prevSettings} = state;
        const {value, settings = {}} = props;

        if (
            prevValue === INITIAL ||
            !isEqual_(prevValue, value) ||
            !isEqual_(prevSettings, settings)
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
        const {inline, children, className} = this.props;
        const {settings} = this.state;

        const classes = block('unipika-wrapper')(
            {
                inline: inline && 'yes',
            },
            className,
        );

        return (
            <ConfigurableErrorBoundary>
                {settings!.asHTML ? (
                    <div className={classes} title={this.getFormattedTitle()} dir="auto">
                        <pre
                            className="unipika"
                            dangerouslySetInnerHTML={{
                                __html: this.getFormattedValue(),
                            }}
                        />
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
            </ConfigurableErrorBoundary>
        );
    }
}

export function Yson(props: YsonProps) {
    const fromContext = useUnipikaSettings();
    const settings = props.settings || fromContext;
    return <YsonImpl {...props} settings={settings} />;
}
