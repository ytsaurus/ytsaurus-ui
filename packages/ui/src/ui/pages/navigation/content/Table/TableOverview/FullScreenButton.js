import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import Button from '../../../../../components/Button/Button';
import Icon from '../../../../../components/Icon/Icon';

import {toggleFullScreen} from '../../../../../store/actions/navigation/content/table/table';
import {isFullScreenAllowed} from '../../../../../components/FullScreen/FullScreen';

FullScreenButton.propTypes = {
    // from parent
    block: PropTypes.func.isRequired,

    // from connect
    isFullScreen: PropTypes.bool.isRequired,
    toggleFullScreen: PropTypes.func.isRequired,
};

function FullScreenButton({block, toggleFullScreen, isFullScreen}) {
    useEffect(() => {
        // Sets correct isSticky flag value from the <Sticky/> component after exit from fullscreen mode ¯\_(ツ)_/¯
        const dispatchScrollEvent = () => window.dispatchEvent(new Event('scroll'));
        setTimeout(dispatchScrollEvent, 100);
    }, [isFullScreen]);

    return (
        isFullScreenAllowed() && (
            <div className={block('fs-button', {fullscreen: isFullScreen})}>
                <Button size="m" title="Toggle full screen" onClick={toggleFullScreen}>
                    <Icon awesome={isFullScreen ? 'compress' : 'expand'} />
                </Button>
            </div>
        )
    );
}

const mapStateToProps = (state) => {
    const {isFullScreen} = state.navigation.content.table;

    return {isFullScreen};
};

const mapDispatchToProps = {
    toggleFullScreen,
};

export default connect(mapStateToProps, mapDispatchToProps)(FullScreenButton);
