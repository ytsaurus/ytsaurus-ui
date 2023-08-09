import React from 'react';
import PropTypes from 'prop-types';
import {Loader} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import Error from '../../components/Error/Error';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';

import {getDisplayName} from '../../utils';

const block = cn('with-data-loader');

// This type might be used to provide title of error
// Just wrap your error into object like this:
const ErrorWithTitle = PropTypes.shape({
    message: PropTypes.string,
    error: PropTypes.any,
});

const ErrorType = PropTypes.oneOfType([ErrorWithTitle, PropTypes.any]);

export type DataLoaderProps = {
    className?: string;

    loading?: boolean;
    loaded?: boolean;

    hideLoader?: boolean;

    hasError?: boolean;
    error?: {message?: string; error?: any} | any;

    loadData: () => void;
    cancelLoadData: () => void;
};

/**
 * The HOC is might be useful to wrap components which requires some data loading, but not only for them.
 * It is important to notice all properties is not required,
 * and by default it is supposed that all required data is loaded (see defaultProps).
 * See comments for properties.
 * @param Component
 */
export default function withDataLoader<P extends DataLoaderProps>(
    Component: React.ComponentType<P>,
) {
    return class WithDataLoader extends React.Component<P> {
        static propTypes = {
            className: PropTypes.string,

            loading: PropTypes.bool,
            loaded: PropTypes.bool,

            /**
             * In some rare circumstances runtime might throw `undefined` or `null` value
             * and without `hasError` flag such cases might be missing
             */
            hasError: PropTypes.bool,
            error: ErrorType,

            loadData: PropTypes.func,
            cancelLoadData: PropTypes.func,
        };

        static defaultProps = {
            loaded: true,
            loadData: () => {},
            cancelLoadData: () => {},
        };

        static displayName = `WithDataLoader(${getDisplayName(Component)})`;

        componentDidMount() {
            this.props.loadData();
        }

        componentWillUnmount() {
            this.props.cancelLoadData();
        }

        renderContent() {
            const {className, hideLoader, loading, loaded, hasError, error} = this.props;
            if (hasError || error) {
                const {message, error: errorData} = error || ({} as any);
                return <Error className={className} error={errorData || error} message={message} />;
            }

            if (loading && !loaded) {
                return hideLoader ? null : (
                    <div className={block(null, className)}>
                        <Loader />
                    </div>
                );
            }

            return !loaded ? null : <Component {...this.props} />;
        }

        render() {
            const {className} = this.props;
            return <ErrorBoundary className={className}>{this.renderContent()}</ErrorBoundary>;
        }
    };
}
