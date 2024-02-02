import React from 'react';

import UIFactory from '../../UIFactory';
import {uiSettings} from '../../config/ui-settings';
import {openInNewTab} from '../../utils/utils';

export function SupportComponent({
    makeContent,
}: {
    makeContent: Parameters<typeof UIFactory.makeSupportContent>[1];
}) {
    const {reportBugUrl} = uiSettings;
    const onSupportClick = React.useCallback(() => {
        if (reportBugUrl) openInNewTab(reportBugUrl);
    }, [reportBugUrl]);

    return reportBugUrl ? <>{makeContent({onSupportClick})}</> : null;
}
