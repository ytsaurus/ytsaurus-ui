import * as React from 'react';

import {Loader as LoaderComponent} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import './Loader.scss';

const block = cn('yql-loader');

type LoaderProps = {
    className?: string;
    size?: 's' | 'm' | 'l';
    statical?: boolean;
    local?: boolean;
    delay?: number;
    veil?: boolean;
};

export default function Loader({className, size, local, statical, delay = 600, veil}: LoaderProps) {
    const [showLoader, setShowLoader] = React.useState(false);

    React.useEffect(() => {
        const timerId = setTimeout(() => {
            setShowLoader(true);
        }, delay);
        return () => {
            clearTimeout(timerId);
        };
    }, []);

    if (!showLoader) {
        return null;
    }
    return (
        <div className={block({local, veil, statical}, className)}>
            <LoaderComponent size={size} />
        </div>
    );
}
