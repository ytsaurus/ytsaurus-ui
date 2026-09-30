import React, {useState} from 'react';
import cn from 'bem-cn-lite';

import {ClipboardButton} from '@ytsaurus/components';

import './FormattedId.scss';

const block = cn('table-formatters-id');

export type FormattedIdProps = {
    id: string | number;
};

export default function FormattedId({id}: FormattedIdProps) {
    const [hovered, setHovered] = useState(false);
    const handleMouseEnter = () => setHovered(true);
    const handleMouseLeave = () => setHovered(false);

    return (
        <div
            className={block({hovered: hovered ? 'yes' : 'no'})}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <span className="elements-ellipsis">{id}</span>
            {hovered && (
                <div className={block('clipboard-button-wrapper')}>
                    <ClipboardButton view="flat-secondary" size="m" text={id} />
                </div>
            )}
        </div>
    );
}
