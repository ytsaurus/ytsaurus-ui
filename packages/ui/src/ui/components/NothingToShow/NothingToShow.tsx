import React from 'react';
import NothingImage from '../../../../img/svg/il_dir.svg';
import './NothingToShow.scss';

type Props = {
    title?: string;
    description?: string;
};

export const NothingToShow = ({
    title = 'Nothing to show',
    description = 'Empty here...',
}: Props) => {
    return (
        <div className="nothing-to-show">
            <div className="icon">
                <NothingImage />
            </div>
            <h4>{title}</h4>
            {description && <span>{description}</span>}
        </div>
    );
};
