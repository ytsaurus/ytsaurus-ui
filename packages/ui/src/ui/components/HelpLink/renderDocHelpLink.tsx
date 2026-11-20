import React from 'react';

import UIFactory from '../../UIFactory';
import {isDocsAllowed} from '../../config';
import {type DocsUrls} from '../../constants/docsUrls';
import HelpLink from './HelpLink';

type DocHelpLinkOptions = Omit<React.ComponentProps<typeof HelpLink>, 'url'> & {
    docKey: keyof DocsUrls;
    fallback?: React.ReactNode;
};

export function renderDocHelpLink({docKey, fallback, ...linkProps}: DocHelpLinkOptions) {
    if (!isDocsAllowed()) {
        return fallback ?? null;
    }

    const url = UIFactory.docsUrls[docKey];
    return url ? <HelpLink url={url} {...linkProps} /> : null;
}
