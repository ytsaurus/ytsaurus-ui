import React, {Component} from 'react';

import Block from '../../components/Block/Block';

const propTypes = Block.propTypes;

export default class Alert extends Component {
    render() {
        const props = this.props;

        return <Block {...props} type="alert" />;
    }
}

Alert.propTypes = propTypes;
