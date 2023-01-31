import React, {Component} from 'react';
import PropTypes from 'prop-types';

import ErrorBlock from '../../components/Block/Block';
import {rumLogError} from '../../rum/rum-counter';

export default class ErrorBoundary extends Component {
    static propTypes = {
        children: PropTypes.node,
    };

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
        };
    }

    state = {
        hasError: false,
        error: {},
    };

    componentDidUpdate() {
        const {hasError, error} = this.state;

        if (hasError) {
            console.error(error);
        }
    }

    componentDidCatch(error) {
        rumLogError(
            {
                type: 'error-boundary',
            },
            error,
        );
    }

    render() {
        const {hasError, error} = this.state;
        const {children} = this.props;

        return hasError ? <ErrorBlock error={error} /> : children;
    }
}
