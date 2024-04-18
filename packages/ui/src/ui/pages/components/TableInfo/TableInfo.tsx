import React from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import './TableInfo.scss';

const block = cn('table-info');

type TableInfoProps = {
    showingItems: number;
    totalItems: number;
}

export default function TableInfo({showingItems, totalItems}: TableInfoProps) {
    return (
        <div className={block('info')}>
            <p className={block('showing')}>
                <span className={block('info-text')}>Showing</span>
                <span className={block('info-count')}>{showingItems}</span>
            </p>

            <p className={block('total')}>
                <span className={block('info-text')}>Total</span>
                <span className={block('info-count')}>{totalItems}</span>
            </p>
        </div>
    );
}

TableInfo.propTypes = {
    showingItems: PropTypes.number.isRequired,
    totalItems: PropTypes.number.isRequired,
};
