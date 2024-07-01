import * as React from 'react';
import {useEffect, useState} from 'react';
import {ChartKitError} from '@gravity-ui/chartkit';
import {Button} from '@gravity-ui/uikit';

import './ChartErrorBoundary.scss';

const renderError = ({
    error,
    refreshClick,
}: {
    error: ChartKitError | Error;
    refreshClick(): void;
}) => {
    return (
        <div className="chart-error-boundary">
            <div>
                <p>
                    {error?.message}
                    <br />
                </p>
                <Button view="action" onClick={refreshClick}>
                    Try again
                </Button>
            </div>
        </div>
    );
};

interface ChartErrorBoundaryProps {
    deps: Record<string, unknown>;
    children: (args: {handleError({error}: {error: ChartKitError}): void}) => React.ReactElement;
}

export const ChartErrorHandler = ({children, deps}: ChartErrorBoundaryProps) => {
    const [error, setError] = useState<ChartKitError>();

    const handleError = ({error}: {error: ChartKitError}) => {
        setError(error);
    };

    const handleRefreshClick = () => {
        setError(undefined);
    };

    useEffect(() => {
        setError(undefined);
    }, [deps]);

    if (error) {
        return renderError({error, refreshClick: handleRefreshClick});
    }

    return children({handleError});
};

export class ChartErrorBoundary extends React.Component<
    React.PropsWithChildren<Readonly<{}>>,
    {error?: Error | ChartKitError}
> {
    static getDerivedStateFromError(error: Error) {
        return {error};
    }

    constructor(props: React.PropsWithChildren<Readonly<{}>>) {
        super(props);

        this.state = {error: undefined};
    }

    componentDidCatch() {}

    handleRefreshClick = () => {
        this.setState({error: undefined});
    };

    render() {
        if (this.state.error) {
            return renderError({
                error: this.state.error,
                refreshClick: this.handleRefreshClick,
            });
        }

        return this.props.children;
    }
}
