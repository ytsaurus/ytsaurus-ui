import React, {Component} from 'react';

import {YTErrorBlock} from '../../components/Error/Error';
import hammer from '../../common/hammer';

import {showErrorPopup} from '../../utils/utils';
import {YTError} from '../../types';
import {toaster} from '../../utils/toaster';

interface LoadDataHandlerProps {
    alwaysShowError?: boolean;
    loaded?: boolean;
    error?: boolean;
    errorData?: YTError;
    children: React.ReactNode;
}

export default class LoadDataHandler extends Component<LoadDataHandlerProps> {
    componentDidUpdate() {
        const {error, loaded, errorData} = this.props;

        if (error && loaded) {
            toaster.add({
                theme: 'danger',
                name: 'network',
                autoHiding: 500000,
                title: 'Oops! something went wrong.',
                content: errorData ? (errorData as YTError).message : hammer.format.NO_VALUE,
                actions: [
                    {
                        label: ' view',
                        onClick: () => showErrorPopup(errorData as YTError),
                    },
                ],
            });
        }
    }

    render() {
        const {alwaysShowError = false, error, errorData, loaded, children} = this.props;

        const initialLoading = !loaded;

        if (error && (alwaysShowError || initialLoading)) {
            return <YTErrorBlock error={errorData} />;
        }

        return children;
    }
}
