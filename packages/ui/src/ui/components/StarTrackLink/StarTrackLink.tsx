import React from 'react';
import {Link} from '@gravity-ui/uikit';
import {uiSettings} from '../../config/ui-settings';

function StarTrackLink(props: {id: string; emptyContent?: React.ReactNode}) {
    const {id, emptyContent = null, ...rest} = props;

    const {trackerBaseUrl} = uiSettings;
    const url = trackerBaseUrl && id ? `${trackerBaseUrl}/${id}` : undefined;
    return !url ? (
        <>{emptyContent}</>
    ) : (
        <Link {...rest} href={url}>
            {id}
        </Link>
    );
}

export default React.memo(StarTrackLink);
