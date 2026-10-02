import React, {useEffect, useRef} from 'react';
import screenfull from 'screenfull';
import cn from 'bem-cn-lite';

const block = cn('fullscreen');

export type FullScreenProps = {
    children: React.ReactNode;
    enabled?: boolean;
    className?: string;
    onChange?: (enabled: boolean) => void;
};

export default function FullScreen({
    enabled = false,
    children,
    className,
    onChange = () => {},
}: FullScreenProps) {
    const container = useRef<HTMLDivElement>(null);

    const toggleScreen = () => {
        if (screenfull.isFullscreen && !enabled) {
            screenfull.exit();
        } else if (!screenfull.isFullscreen && enabled) {
            screenfull.request(container.current as HTMLDivElement);
        }
    };

    const callback = () => onChange(screenfull.isFullscreen);
    const listenScreenChange = () => {
        if (!isFullScreenAllowed()) {
            return undefined;
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
