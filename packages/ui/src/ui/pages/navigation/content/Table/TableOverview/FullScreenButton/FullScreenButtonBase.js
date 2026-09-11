import React, {useEffect} from 'react';
import PropTypes from 'prop-types';

import Button from '../../../../../../components/Button/Button';
import Icon from '../../../../../../components/Icon/Icon';
import {isFullScreenAllowed} from '../../../../../../components/FullScreen/FullScreen';
import i18n from '../i18n';

FullScreenButtonBase.propTypes = {
    // from parent
    block: PropTypes.func.isRequired,

    // from connect
    isFullScreen: PropTypes.bool.isRequired,
    toggleFullScreen: PropTypes.func.isRequired,
};

export function FullScreenButtonBase({block, toggleFullScreen, isFullScreen}) {
    useEffect(() => {
        // Sets correct isSticky flag value from the <Sticky/> component after exit from fullscreen mode ¯\_(ツ)_/¯
        const dispatchScrollEvent = () => window.dispatchEvent(new Event('scroll'));
        setTimeout(dispatchScrollEvent, 100);
    }, [isFullScreen]);

    return (
        isFullScreenAllowed() && (
            <div className={block('fs-button', {fullscreen: isFullScreen})}>
                <Button
                    size="m"
                    title={i18n('action_toggle-full-screen')}
                    onClick={toggleFullScreen}
                >
                    <Icon awesome={isFullScreen ? 'compress' : 'expand'} size={13} />
                </Button>
            </div>
        )
    );
}
