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
import i18n from './i18n';

import './PreloadError.scss';

const b = block('yt-preload-error');

function PreloadError() {
    const cluster = useClusterFromLocation();
    const error = useSelector(getGlobalError) ?? new Error('Unexpected error: error is undefined');
    const errorType = useSelector(getGlobalErrorType) ?? PRELOAD_ERROR.GENERAL;

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
                    {i18n('action_details')}
                </ClickableText>
            </p>

            {UIFactory.renderCustomPreloaderError({cluster, errorType, error})}
        </section>
    );
}

function getErrorData({errorType, cluster}: {errorType?: string; cluster: string}): {
    title: string;
    message: string;
} {
    switch (errorType) {
        case PRELOAD_ERROR.CONNECTION: {
            return {
                title: `${cluster.toUpperCase()} ${i18n('title_connection-error')}`,
                message: i18n('alert_connection-failed'),
            };
        }
        case PRELOAD_ERROR.AUTHENTICATION: {
            return {
                title: i18n('title_error'),
                message: i18n('alert_authentication-failed'),
            };
        }
        case PRELOAD_ERROR.GENERAL:
        default: {
            return {
                title: i18n('title_error'),
                message: i18n('alert_general-error'),
            };
        }
    }
}

export default withBlockedNavigation(PreloadError);
