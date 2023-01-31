import React, {Component} from 'react';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';

import './StatusBulb.scss';

interface Props {
    theme: 'unknown' | 'enabled' | 'disabled';
}

class StatusBulb extends Component<Props> {
    static propTypes = {
        theme: PropTypes.string,
    };

    render() {
        const className = block('status-bulb')({theme: this.props.theme});
        return <div className={className}></div>;
    }
}

export default StatusBulb;
