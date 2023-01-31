import React from 'react';

import templates from './utils.js';
import hammer from '../../common/hammer';

templates.add('elements/meta', {
    /**
     * @param {Object} settings
     * @param {String} settings.key
     * @param {String} settings.value
     * @param {Function|String} [settings.valueFormat]
     * @param {Function} [settings.valueTemplate]
     * @returns {XML}
     */
    item(settings) {
        // React implementation for 'elements/meta/item'

        const {key} = settings;
        const caption = hammer.format['ReadableField'](key);
        const valueFormat =
            typeof settings.valueFormat === 'function'
                ? settings.valueFormat
                : hammer.format[
                      typeof settings.valueFormat === 'string'
                          ? settings.valueFormat
                          : 'ValueOrDefault'
                  ];

        return (
            <div key={key} className="elements-meta-item">
                <div className="elements-meta-item__key">{caption}</div>
                <div className="elements-meta-item__value">
                    {settings.valueTemplate
                        ? settings.valueTemplate(settings.value)
                        : valueFormat(settings.value)}
                </div>
            </div>
        );
    },
});
