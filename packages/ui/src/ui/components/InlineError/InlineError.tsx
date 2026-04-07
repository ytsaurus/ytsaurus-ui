import React from 'react';
import {YTError} from '../../../@types/types';
import {ClickableText} from '../../components/ClickableText/ClickableText';
import {showErrorPopup} from '../../utils/utils';
import i18n from './i18n';

type InlineErrorProps = {
    error?: YTError;
};

export function InlineError({error}: InlineErrorProps) {
    return !error ? null : (
        <span className={'yt-error-inline'}>
            {error.message || i18n('error_default-message')} &nbsp;
            <ClickableText onClick={() => showErrorPopup(error)}>
                {i18n('action_details')}
            </ClickableText>
        </span>
    );
}
