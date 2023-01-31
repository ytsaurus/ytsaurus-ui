import React, {useState} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';

import './FormattedId.scss';

const block = cn('table-formatters-id');

FormattedId.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default function FormattedId({id}) {
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
