import React, {Component} from 'react';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';
import unipika from '@gravity-ui/unipika/lib/unipika';

import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import Yson from '../../components/Yson/Yson';

export default class YqlValue extends Component {
    static propTypes = {
        settings: PropTypes.object,
        value: PropTypes.any,
        type: PropTypes.array,
        inline: PropTypes.bool,
    };

    static defaultProps = {
        inline: false,
        folding: false,
        settings: Yson.defaultUnipikaSettings,
    };

    static getFormattedValue(value, type, settings) {
        const yqlValue = [value, type];

        return settings.format === 'raw-json'
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
                settings.format === 'raw-json'
                    ? unipika.formatRaw(value, titleSettings)
                    : unipika.formatFromYQL(value, titleSettings);
        }

        const classes = block('unipika-wrapper')({
            inline: inline && 'yes',
        });

        return (
            <ErrorBoundary>
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
                        dir="auto"
                        dangerouslySetInnerHTML={{__html: formattedValue}}
                    />
                )}
            </ErrorBoundary>
        );
    }
}
