import React from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import HighlightedText from '../../components/HighlightedText/HighlightedText';

import './AclColumn.scss';

const block = cn('acl-column-name');

Q.propTypes = {
    hasComa: PropTypes.bool,
};

function Q({hasComa}) {
    return (
        <React.Fragment>
            <span className={block('quot')}>&quot;</span>
            {hasComa && <>,&nbsp;</>}
        </React.Fragment>
    );
}

AclColumn.propTypes = {
    className: PropTypes.string,
    column: PropTypes.string,

    hasComa: PropTypes.bool,
    highlightStart: PropTypes.number,
    highlightLength: PropTypes.number,
};

export default function AclColumn({className, column, highlightStart, hasComa, highlightLength}) {
    return (
        <span className={block(null, className)}>
            <Q />
            <HighlightedText
                text={column}
                className={block('text')}
                start={highlightStart}
                length={highlightLength}
            />
            <Q hasComa={hasComa} />
        </span>
    );
}
