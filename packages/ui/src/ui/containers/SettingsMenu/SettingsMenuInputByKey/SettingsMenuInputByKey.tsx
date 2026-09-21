import React, {useCallback, useState} from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';

import {TextInput} from '@gravity-ui/uikit';

const block = cn('elements-page');

SettingsMenuInputBase.propTypes = {
    // from connect
    getSetting: PropTypes.func.isRequired,
    setSetting: PropTypes.func.isRequired,

    // from parent
    settingName: PropTypes.string.isRequired,
    settingNS: PropTypes.object.isRequired,

    heading: PropTypes.string,
    description: PropTypes.string,
    placeholder: PropTypes.string,
    validator: PropTypes.func,
};

export function SettingsMenuInputBase({
    getSetting,
    setSetting,
    settingName,
    settingNS,
    heading,
    description,
    placeholder,
    validator,
}) {
    const initialValue = getSetting(settingName, settingNS);
    const [value, setValue] = useState(initialValue);
    const error = validator?.(value);
    const handleBlur = useCallback(() => {
        if (!error) {
            setSetting(settingName, settingNS, value);
        }
    }, [setSetting, settingName, settingNS, value]);

    return (
        <div className={block('settings-item')}>
            {heading && <div className={block('settings-radio-heading')}>{heading}</div>}

            <TextInput
                hasClear
                size="m"
                placeholder={placeholder}
                onUpdate={setValue}
                onBlur={handleBlur}
                error={error}
                value={value}
            />

            {description && (
                <div className={block('settings-description', 'elements-secondary-text')}>
                    {description}
                </div>
            )}
        </div>
    );
}
