import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';

import {Checkbox, Switch} from '@gravity-ui/uikit';

import {setSetting} from '../../store/actions/settings';
import {makeGetSetting} from '../../store/selectors/settings';

import './SettingsMenu.scss';

const b = block('elements-page');

class SettingsMenuItem extends Component {
    static propTypes = {
        // from connect
        getSetting: PropTypes.func.isRequired,
        setSetting: PropTypes.func.isRequired,
        // from props
        settingName: PropTypes.string.isRequired,
        settingNS: PropTypes.object.isRequired,
        label: PropTypes.string,
        annotation: PropTypes.string,
        annotationHighlight: PropTypes.string,

        oneLine: PropTypes.bool,

        useSwitch: PropTypes.bool,
    };

    render() {
        const {
            annotationHighlight,
            settingName,
            annotation,
            setSetting,
            getSetting,
            settingNS,
            label,
            oneLine,
            useSwitch,
        } = this.props;
        const checked = getSetting(settingName, settingNS);

        return (
            <div
                className={b('settings-item', {
                    size: 's',
                    name: settingName,
                    'one-line': oneLine,
                })}
                title={label}
            >
                {useSwitch ? (
                    <Switch
                        checked={checked}
                        onUpdate={(value) => setSetting(settingName, settingNS, value)}
                    />
                ) : (
                    <Checkbox
                        content={label}
                        checked={checked}
                        onUpdate={(value) => setSetting(settingName, settingNS, value)}
                    />
                )}
                <div className={b('settings-annotation', 'elements-secondary-text')}>
                    <span dangerouslySetInnerHTML={{__html: annotation}} />
                    {annotationHighlight && (
                        <Fragment>
                            <br />
                            <span
                                className={b('settings-annotation-highlight')}
                                dangerouslySetInnerHTML={{
                                    __html: annotationHighlight,
                                }}
                            />
                        </Fragment>
                    )}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        getSetting: makeGetSetting(state),
    };
}

export default connect(mapStateToProps, {setSetting})(SettingsMenuItem);
