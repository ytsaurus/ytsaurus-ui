import React from 'react';
import PropTypes from 'prop-types';
import Link from '../../components/Link/Link';
import cn from 'bem-cn-lite';

import Icon from '../../components/Icon/Icon';

import './HelpLink.scss';

const propTypes = {
    url: PropTypes.string.isRequired,
    text: PropTypes.string,
};

const block = cn('yt-help-link');

interface Props {
    url?: string;
    text?: string;
}

function HelpLink({url, text = 'Help'}: Props) {
    return !url ? null : (
        <Link url={url} target="_blank" title="View documentation">
            <Icon awesome="book" />
            {text && <span className={block('text')}>{text}</span>}
        </Link>
    );
}

HelpLink.propTypes = propTypes;

export default HelpLink;
