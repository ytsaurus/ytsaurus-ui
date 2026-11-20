import React from 'react';
import PropTypes from 'prop-types';
import {Link} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import Icon from '../../components/Icon/Icon';
import i18n from './i18n';

import './HelpLink.scss';

const propTypes = {
    url: PropTypes.string.isRequired,
    text: PropTypes.string,
    hideIcon: PropTypes.bool,
};

const block = cn('yt-help-link');

interface Props {
    url?: string;
    text?: string;
    hideIcon?: boolean;
}

function HelpLink({url, text = i18n('value_help'), hideIcon}: Props) {
    if (!url) {
        return null;
    }

    if (hideIcon) {
        return (
            <Link href={url} target="_blank">
                {text}
            </Link>
        );
    }

    return (
        <Link href={url} target="_blank" title={i18n('title_view-documentation')}>
            <Icon awesome="book" size={14} />
            {text && <span className={block('text')}>{text}</span>}
        </Link>
    );
}

HelpLink.propTypes = propTypes;

export default HelpLink;
