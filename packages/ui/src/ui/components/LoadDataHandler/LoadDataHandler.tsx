import React, {Component} from 'react';

import {Toaster} from '@gravity-ui/uikit';
import Error from '../../components/Error/Error';
import hammer from '../../common/hammer';

import {showErrorPopup} from '../../utils/utils';
import {YTError} from '../../types';

const toaster = new Toaster();

interface LoadDataHandlerProps {
    alwaysShowError?: boolean;
    loaded: boolean;
    error: boolean;
    errorData?: YTError;
    children: React.ReactNode;
}

export default class LoadDataHandler extends Component<LoadDataHandlerProps> {
    componentDidUpdate() {
        const {error, loaded, errorData} = this.props;

        if (error && loaded) {
            toaster.createToast({
                type: 'error',
                name: 'network',
                timeout: 500000,
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
            return <Error error={errorData} />;
        }

        return children;
    }
}
