import React from 'react';
import {useSelector} from 'react-redux';
import block from 'bem-cn-lite';

import withBlockedNavigation from '../../hocs/withBlockedNavigation';
import {getGlobalError, getGlobalErrorType} from '../../store/selectors/global';
import {showErrorPopup} from '../../utils/utils';
import UIFactory from '../../UIFactory';
import {ClickableText} from '../../components/ClickableText/ClickableText';
import {PRELOAD_ERROR} from '../../constants';
import {useClusterFromLocation} from '../../hooks/use-cluster';

import './PreloadError.scss';

const b = block('yt-preload-error');

function PreloadError() {
    const cluster = useClusterFromLocation();
    const error = useSelector(getGlobalError);
    const errorType = useSelector(getGlobalErrorType);

    const {title, message} = getErrorData({
        errorType,
        cluster,
    });

    return (
        <section className={b('error')}>
            <h2 className={b('title')}>{title}</h2>

            <p className={b('text')}>
                {message}
                <ClickableText className={b('details')} onClick={() => showErrorPopup(error)}>
                    {' '}
                    Details
                </ClickableText>
            </p>

            {UIFactory.renderCustomPreloaderError({cluster, errorType, error})}
        </section>
    );
}

function getErrorData({errorType, cluster}: {errorType: string; cluster: string}): {
    title: string;
    message: string;
} {
    switch (errorType) {
        case PRELOAD_ERROR.CONNECTION: {
            return {
                title: `${cluster.toUpperCase()} couldn’t be reached`,
                message:
                    'Failed to fetch version of the cluster. Usually it means UI cannot establish connection to the cluster’s proxy.',
            };
        }
        case PRELOAD_ERROR.AUTHENTICATION: {
            return {
                title: 'Error',
                message:
                    'Could not fetch the XSRF token, therefore preventing further operations. Sometimes ' +
                    'token fetching fails due to the network issues. If the  problem persists, please report it.',
            };
        }
        case PRELOAD_ERROR.GENERAL:
        default: {
            return {
                title: 'Error',
                message:
                    'An error occurred while fetching the necessary information about the cluster.',
            };
        }
    }
}

export default withBlockedNavigation(PreloadError);
