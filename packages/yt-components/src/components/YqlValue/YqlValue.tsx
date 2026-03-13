import React from 'react';
import block from 'bem-cn-lite';
import unipika from '../../utils/unipika';

import {ConfigurableErrorBoundary} from '../../context';
import {Yson} from '../Yson';
import {UnipikaSettings} from '../Yson/StructuredYson/StructuredYsonTypes';

/**
 * See unipika for more details
 */
export type UnipikaValueType = Array<string | UnipikaValueType>;

export type YqlValueProps = {
    value?: unknown;
    type: UnipikaValueType;
    settings?: UnipikaSettings;
    inline?: boolean;
};

export class YqlValue extends React.Component<YqlValueProps> {
    static defaultProps = {
        inline: false,
        settings: Yson.defaultUnipikaSettings,
    };

    static getFormattedValue(value: unknown, type: UnipikaValueType, settings?: UnipikaSettings) {
        const yqlValue = [value, type];

        return settings?.format === 'raw-json'
            ? unipika.formatRaw(yqlValue, settings)
            : unipika.formatFromYQL(yqlValue, settings);
    }

    render() {
        const {value, type, inline, settings} = this.props;

        const formattedValue = YqlValue.getFormattedValue(value, type, settings);

        let title;

        if (inline) {
            const titleSettings = Object.assign({}, settings, {
                asHTML: false,
            });

            title =
                settings?.format === 'raw-json'
                    ? unipika.formatRaw(value, titleSettings)
                    : unipika.formatFromYQL(value, titleSettings);
        }

        const classes = block('unipika-wrapper')({
            inline: inline && 'yes',
        });

        return (
            <ConfigurableErrorBoundary>
                {settings?.asHTML ? (
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
                        dir="auto"
                        dangerouslySetInnerHTML={{__html: formattedValue}}
                    />
                )}
            </ConfigurableErrorBoundary>
        );
    }
}
