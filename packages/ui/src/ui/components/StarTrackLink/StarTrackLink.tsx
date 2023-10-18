import React from 'react';
import Link from '../Link/Link';
import {uiSettings} from '../../config/ui-settings';

function StarTrackLink(props: {id: string; emptyContent?: React.ReactNode}) {
    const {id, emptyContent = null, ...rest} = props;

    const {trackerBaseUrl} = uiSettings;
    const url = `${trackerBaseUrl}/${id}`;
    return !id ? (
        <>{emptyContent}</>
    ) : (
        <Link {...rest} url={trackerBaseUrl ? url : undefined}>
            {id}
        </Link>
    );
}

export default React.memo(StarTrackLink);
