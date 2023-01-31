import React, {useEffect, useRef} from 'react';
import screenfull from 'screenfull';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

const block = cn('fullscreen');

FullScreen.propTypes = {
    children: PropTypes.node.isRequired,
    enabled: PropTypes.bool.isRequired,
    className: PropTypes.string,
    onChange: PropTypes.func,
};

FullScreen.defaultProps = {
    enabled: false,
    onChange: () => {},
};

export default function FullScreen({enabled, children, className, onChange}) {
    const container = useRef(null);

    const toggleScreen = () => {
        if (screenfull.isFullscreen && !enabled) {
            screenfull.exit();
        } else if (!screenfull.isFullscreen && enabled) {
            screenfull.request(container.current);
        }
    };

    const callback = () => onChange(screenfull.isFullscreen);
    const listenScreenChange = () => {
        if (!isFullScreenAllowed()) {
            return;
        }

        screenfull.on('change', callback);
        return () => {
            screenfull.off('change', callback);
        };
    };

    useEffect(toggleScreen, [enabled]);
    useEffect(listenScreenChange);

    return (
        <div className={block({enabled}, className)} ref={container}>
            {children}
        </div>
    );
}

export function isFullScreenAllowed() {
    const {isEnabled, on} = screenfull || {};
    return isEnabled && 'function' === typeof on;
}
