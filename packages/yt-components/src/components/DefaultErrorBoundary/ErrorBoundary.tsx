import React, {Component} from 'react';

import './ErrorBoundary.scss';
import {SimpleErrorFallback} from './SimpleErrorFallback';
import {getErrorMessage} from './getErrorMessage';

export type ErrorBoundaryProps = {
    children: React.ReactNode;
    onError?: (error: unknown) => void;
};

type State = {hasError: false; error: undefined} | {hasError: true; error: Error};

export default class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
    static getDerivedStateFromError(error: unknown) {
        return {
            hasError: true,
            error: error instanceof Error ? error : new Error(getErrorMessage(error)),
        };
    }

    state: State = {
        hasError: false,
        error: undefined,
    };

    componentDidUpdate() {
        const {hasError, error} = this.state;
        if (hasError && error) {
            console.error(error);
        }
    }

    componentDidCatch(error: unknown) {
        console.error({type: 'error-boundary'}, error);
        this.props.onError?.(error);
    }

    render() {
        const {hasError, error} = this.state;
        const {children} = this.props;

        if (hasError && error) {
            return <SimpleErrorFallback error={error} />;
        }
        return children;
    }
}
