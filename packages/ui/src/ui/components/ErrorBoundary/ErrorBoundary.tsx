import React, {Component} from 'react';

import {YTErrorBlock} from '../../components/Block/Block';
import CompactError from '../CompactError/CompactError';

import {rumLogError} from '../../rum/rum-counter';
import {YTError} from '../../../@types/types';

export type ErrorBoundaryProps = {
    className?: string;

    disableRum?: boolean;
    error?: YTError;

    compact?: true;
    maxCompactMessageLength?: number;

    children: React.ReactNode;

    onError?: (error: any) => void;
};

type State = {hasError: false; error: undefined} | {hasError: true; error: YTError};

export default class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
    static getDerivedStateFromError(error: any) {
        return {
            hasError: true,
            error,
        };
    }

    state: State = {
        hasError: false,
        error: undefined,
    };

    componentDidUpdate() {
        const {hasError, error} = this.state;

        if (hasError && !this.props.disableRum) {
            console.error(error);
        }
    }

    componentDidCatch(error: any) {
        if (!this.props.disableRum) {
            rumLogError(
                {
                    type: 'error-boundary',
                },
                error,
            );
        }
        this.props.onError?.(error);
    }

    render() {
        const {hasError, error} = this.state;
        const {children, compact, maxCompactMessageLength} = this.props;
        if (compact || maxCompactMessageLength) {
            return hasError ? (
                <CompactError error={error} maxMessageLength={maxCompactMessageLength} />
            ) : (
                children
            );
        }
        return hasError ? <YTErrorBlock error={error} /> : children;
    }
}
