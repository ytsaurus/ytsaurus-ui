import React from 'react';
import block from 'bem-cn-lite';
import unipika from '../../utils/unipika';

import {UnipikaSettings} from '../../internal/Yson/StructuredYson/StructuredYsonTypes';
import type {ErrorBoundaryProps} from '../../internal/DefaultErrorBoundary';
import DefaultErrorBoundary from '../../internal/DefaultErrorBoundary/ErrorBoundary';

export type UnipikaValueType = Array<string | UnipikaValueType>;

export type YqlValueProps = {
    value?: unknown;
    type: UnipikaValueType;
    settings: UnipikaSettings;
    inline?: boolean;
    ErrorBoundaryComponent?: React.ComponentType<ErrorBoundaryProps>;
};

export class YqlValue extends React.Component<YqlValueProps> {
    static getFormattedValue(value: unknown, type: UnipikaValueType, settings?: UnipikaSettings) {
        const yqlValue = [value, type];

        return settings?.format === 'raw-json'
            ? unipika.formatRaw(yqlValue, settings)
            : unipika.formatFromYQL(yqlValue, settings);
    }

    render() {
        const {value, type, inline, settings, ErrorBoundaryComponent} = this.props;
        const ConfigurableErrorBoundary = ErrorBoundaryComponent || DefaultErrorBoundary;

        const formattedValue = YqlValue.getFormattedValue(value, type, settings);

        let title;

        if (inline) {
            const titleSettings = Object.assign({}, settings, {
                asHTML: false,
            });

            title =
                settings.format === 'raw-json'
                    ? unipika.formatRaw(value, titleSettings)
                    : unipika.formatFromYQL(value, titleSettings);
        }

        const classes = block('unipika-wrapper')({
            inline: inline && 'yes',
        });

        return (
            <ConfigurableErrorBoundary>
                {settings.asHTML ? (
                    <div className={classes} title={title} dir="auto">
                        <pre
                            className="unipika"
                            dangerouslySetInnerHTML={{__html: formattedValue}}
                        />
                    </div>
                ) : (
                    <div
                        className={classes}
                        title={title}
                        dangerouslySetInnerHTML={{__html: formattedValue}}
                    />
                )}
            </ConfigurableErrorBoundary>
        );
    }
}
