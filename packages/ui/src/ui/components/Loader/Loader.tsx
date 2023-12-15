import React from 'react';
import cn from 'bem-cn-lite';

import {Loader, LoaderProps} from '@gravity-ui/uikit';

import './Loader.scss';

const block = cn('yt-loader');

export type YTLoaderProps = LoaderProps & {visible?: boolean; centered?: boolean};

function YTLoader({visible, centered, className, size = 's'}: YTLoaderProps) {
    return <div className={block({centered}, className)}>{visible && <Loader size={size} />}</div>;
}

export default React.memo(YTLoader);
