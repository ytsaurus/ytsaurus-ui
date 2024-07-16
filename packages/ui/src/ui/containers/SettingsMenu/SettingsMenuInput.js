import React, {useCallback, useState} from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {TextInput} from '@gravity-ui/uikit';

import {setSetting} from '../../store/actions/settings';
import {makeGetSetting} from '../../store/selectors/settings';

const block = cn('elements-page');

SettingsMenuInput.propTypes = {
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

function SettingsMenuInput({
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

const mapStateToProps = (state) => {
    const getSetting = makeGetSetting(state);

    return {
        getSetting,
    };
};

export default connect(mapStateToProps, {setSetting})(SettingsMenuInput);
