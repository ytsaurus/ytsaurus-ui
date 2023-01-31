import React from 'react';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';
import _ from 'lodash';

import './StatusBlock.scss';

const b = block('status-block');
const Theme = {
    BANNED: 'banned',
    DECOMMISSIONED: 'decommissioned',
    FULL: 'full',
    ALERTS: 'alerts',
    WARNING: 'warning',
    INFO: 'info',
    SUCCESS: 'success',
    DANGER: 'danger',
    DEFAULT: 'default',
};

function StatusBlock({text, theme}) {
    return <span className={b({theme: theme})}>{text}</span>;
}

StatusBlock.propTypes = {
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    theme: PropTypes.oneOf(_.values(Theme)),
};

StatusBlock.defaultProps = {
    theme: Theme.DEFAULT,
};

export default StatusBlock;
