import React from 'react';
import {useSelector} from '../../../store/redux-hooks';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import {selectTabletsActiveBundle} from '../../../store/selectors/tablet_cell_bundles';
import {isPoolAclAllowed} from '../../../store/selectors/scheduling/scheduling';
import {NoContent} from '../../../components/NoContent';
import {BundleAcl} from '../../../containers/ACL';

export default function BundleAclTab({className}: {className: string}) {
    const activeBundle = useSelector(selectTabletsActiveBundle);
    const allowAcl = useSelector(isPoolAclAllowed);
    return (
        <ErrorBoundary>
            {allowAcl ? (
                <BundleAcl {...{path: activeBundle, className}} />
            ) : (
                <NoContent
                    className={className}
                    warning={"The cluster is not ready to work with bundle's ACL"}
                />
            )}
        </ErrorBoundary>
    );
}
