import React from 'react';

import {IdmObjectType} from '../../../constants/acl';
import i18n from './i18n';
import Link from '../../../components/Link/Link';
import {type InheritedFrom} from '../../../utils/acl/acl-types';
import {makeAccountsUrl, makeNavigationLink, makeSchedulingUrl} from '../../../utils/app-url';

function urlFromData(data?: InheritedFrom) {
    switch (data?.kind) {
        case IdmObjectType.PATH: {
            return makeNavigationLink({path: data.name});
        }
        case IdmObjectType.POOL: {
            return makeSchedulingUrl({pool: data.name, poolTree: data.poolTree!});
        }
        case IdmObjectType.ACCOUNT: {
            return makeAccountsUrl(data.name);
        }
        default:
            return undefined;
    }
}

export function InheritanceMessage({data}: {data?: InheritedFrom}) {
    const url = urlFromData(data);
    return !url ? (
        i18n('title_role-inherited')
    ) : (
        <React.Fragment>
            {i18n('title_role-inherited')}{' '}
            <Link routed url={url} routedPreserveLocation>
                {data?.name}
            </Link>
        </React.Fragment>
    );
}
