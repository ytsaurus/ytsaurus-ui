import React, {Component} from 'react';
import PropTypes from 'prop-types';

import ErrorBlock from '../../components/Block/Block';
import CompactError from '../CompactError/CompactError';

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
        const {children, compact} = this.props;
        if (compact) {
            return hasError ? <CompactError error={error} /> : children;
        }
        return hasError ? <ErrorBlock error={error} /> : children;
    }
}
