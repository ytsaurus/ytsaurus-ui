import {FC} from 'react';
import {getErrorMessage} from './getErrorMessage';
import {ClipboardButton} from '@gravity-ui/uikit';

export const SimpleErrorFallback: FC<{error: Error}> = ({error}) => {
    const message = getErrorMessage(error);

    return (
        <div className="yt-error-boundary-fallback">
            <div className="yt-error-boundary-fallback__heading">Error</div>
            <div className="yt-error-boundary-fallback__message">{message}</div>
            <ClipboardButton text={`${error.name}: ${error.message}`} />
        </div>
    );
};
