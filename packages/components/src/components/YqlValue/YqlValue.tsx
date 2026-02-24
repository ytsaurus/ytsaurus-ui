import React from 'react';
import block from 'bem-cn-lite';
import unipika from '../../utils/unipika';

import {ConfigurableErrorBoundary, useUnipikaSettings} from '../../context';
import {UnipikaSettings} from '../../internal/Yson/StructuredYson/StructuredYsonTypes';

export type UnipikaValueType = Array<string | UnipikaValueType>;

export type YqlValueProps = {
    value?: unknown;
    type: UnipikaValueType;
    settings?: UnipikaSettings;
    inline?: boolean;
};

class YqlValueImpl extends React.Component<YqlValueProps> {
    static getFormattedValue(value: unknown, type: UnipikaValueType, settings?: UnipikaSettings) {
        const yqlValue = [value, type];

        return settings?.format === 'raw-json'
            ? unipika.formatRaw(yqlValue, settings)
            : unipika.formatFromYQL(yqlValue, settings);
    }

    render() {
        const {value, type, inline, settings} = this.props;

        const formattedValue = YqlValueImpl.getFormattedValue(value, type, settings);

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
                        dangerouslySetInnerHTML={{__html: formattedValue}}
                    />
                )}
            </ConfigurableErrorBoundary>
        );
    }
}

function YqlValueComponent(props: YqlValueProps) {
    const fromContext = useUnipikaSettings();
    const settings = props.settings !== undefined ? props.settings : fromContext;
    return <YqlValueImpl {...props} settings={settings} />;
}

type YqlValueWithStatic = React.FC<YqlValueProps> & {
    getFormattedValue: typeof YqlValueImpl.getFormattedValue;
};

export const YqlValue: YqlValueWithStatic = Object.assign(YqlValueComponent, {
    getFormattedValue: YqlValueImpl.getFormattedValue,
});
