import React from 'react';
import {YTError} from '../../../@types/types';
import {ClickableText} from '../../components/ClickableText/ClickableText';
import {showErrorPopup} from '../../utils/utils';

type InlineErrorProps = {
    error?: YTError;
};

export function InlineError({error}: InlineErrorProps) {
    return !error ? null : (
        <span className={'yt-error-inline'}>
            {error.message || 'An error occured.'} &nbsp;
            <ClickableText onClick={() => showErrorPopup(error)}>Details</ClickableText>
        </span>
    );
}
