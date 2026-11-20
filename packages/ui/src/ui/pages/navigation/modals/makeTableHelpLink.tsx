import React from 'react';

import {renderDocHelpLink} from '../../../components/HelpLink/renderDocHelpLink';
import {type DocsUrls} from '../../../constants/docsUrls';
import i18n from './CreateTableModal/i18n';

export function makeTableHelpLink(docKey: keyof DocsUrls) {
    const link = renderDocHelpLink({docKey, text: i18n('action_help'), hideIcon: true});
    return link && <div>{link}</div>;
}
