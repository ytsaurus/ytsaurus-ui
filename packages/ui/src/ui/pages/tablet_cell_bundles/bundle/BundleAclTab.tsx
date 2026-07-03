import React from 'react';
import {useSelector} from '../../../store/redux-hooks';
import ErrorBoundary from '../../../containers/ErrorBoundary/ErrorBoundary';
import {selectTabletsActiveBundle} from '../../../store/selectors/tablet_cell_bundles';
import {selectIsPoolAclAllowed} from '../../../store/selectors/scheduling/scheduling';
import {NoContent} from '../../../components/NoContent';
import {BundleAcl} from '../../../containers/ACL';
import i18n from './i18n';

export default function BundleAclTab({className}: {className: string}) {
    const activeBundle = useSelector(selectTabletsActiveBundle);
    const allowAcl = useSelector(selectIsPoolAclAllowed);
    return (
        <ErrorBoundary>
            {allowAcl ? (
                <BundleAcl {...{path: activeBundle, className}} />
            ) : (
                <NoContent
                    className={className}
                    warning={i18n('alert_cluster-not-ready-for-acl')}
                />
            )}
        </ErrorBoundary>
    );
}
