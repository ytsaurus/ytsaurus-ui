import React from 'react';
import {metaTablePresetMain} from '@ytsaurus/components';
import {SubjectCard} from '../../SubjectLink/SubjectLink';
import AccountLink from '../../../pages/accounts/AccountLink';
import {YT} from '../../../config/yt-config';
import UIFactory from '../../../UIFactory';
import {makeNavigationLink} from '../../../utils/app-url';
import {renderDefaultMetaOperationLink} from './defaultMetaOperationLink';

export default function main(attributes: any, cluster?: string) {
    return metaTablePresetMain(attributes, cluster || YT.cluster, {
        SubjectCard: (props) => <SubjectCard {...props} />,
        AccountLink: (props) => <AccountLink {...props} />,
        docsUrls: UIFactory.docsUrls,
        navigationLinkTemplate: ({cluster: c, path}) => makeNavigationLink({path, cluster: c}),
        renderMetaOperationLink: renderDefaultMetaOperationLink,
    });
}
