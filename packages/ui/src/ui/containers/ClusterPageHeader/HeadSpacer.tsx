import React, {FC} from 'react';
import './HeadSpacer.scss';
import cn from 'bem-cn-lite';

const block = cn('yt-head-spacer');

export const HeadSpacer: FC = () => {
    return <div className={block()} />;
};
