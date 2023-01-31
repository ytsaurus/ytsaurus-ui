import React from 'react';
import cn from 'bem-cn-lite';
import {Loader} from '@gravity-ui/uikit';
import './Loader.scss';

const block = cn('yt-loader');

function YTLoader({visible, className}: {visible?: boolean; className?: string}) {
    return <div className={block(null, className)}>{visible && <Loader size={'s'} />}</div>;
}

export default React.memo(YTLoader);
