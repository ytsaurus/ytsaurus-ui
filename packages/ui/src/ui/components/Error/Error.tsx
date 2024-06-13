import React, {Component} from 'react';

import Block from '../../components/Block/Block';

import './Error.scss';

const propTypes = Block.propTypes;
const defaultProps = Block.defaultProps;

export default class Error extends Component {
    render() {
        const props = this.props;

        return <Block {...props} type="error" />;
    }
}

Error.propTypes = propTypes;
Error.defaultProps = defaultProps;
