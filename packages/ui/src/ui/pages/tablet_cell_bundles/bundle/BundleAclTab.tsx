import React from 'react';
import {useSelector} from 'react-redux';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import {getTabletsActiveBundle} from '../../../store/selectors/tablet_cell_bundles';
import {isPoolAclAllowed} from '../../../store/selectors/scheduling/scheduling';
import {NoContent} from '../../../components/NoContent/NoContent';
import {BundleAcl} from '../../../containers/ACL/ACL-connect-helpers';

export default function BundleAclTab() {
    const activeBundle = useSelector(getTabletsActiveBundle);
    const allowAcl = useSelector(isPoolAclAllowed);
    return (
        <ErrorBoundary>
            {allowAcl ? (
                <BundleAcl {...{path: activeBundle}} />
            ) : (
                <NoContent hint={"The cluster is not ready to work with bundle's ACL"} />
            )}
        </ErrorBoundary>
    );
}
