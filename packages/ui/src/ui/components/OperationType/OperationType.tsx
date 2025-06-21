import React from 'react';
import cn from 'bem-cn-lite';

import format from '../../common/hammer/format';

import './OperationType.scss';

const block = cn('yt-operation-type');

export function OperationType({value}: {value?: string}) {
    const text = React.useMemo(() => {
        return format.ReadableField(value);
    }, [value]);

    return <span className={block()}>{text}</span>;
}
