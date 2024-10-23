import React from 'react';

import {IdmObjectType} from '../../../constants/acl';
import Link from '../../../components/Link/Link';
import {InheritedFrom} from '../../../utils/acl/acl-types';
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
        'Role is inherited'
    ) : (
        <React.Fragment>
            Role is inherited{' '}
            <Link routed url={url} routedPreserveLocation>
                {data?.name}
            </Link>
        </React.Fragment>
    );
}
