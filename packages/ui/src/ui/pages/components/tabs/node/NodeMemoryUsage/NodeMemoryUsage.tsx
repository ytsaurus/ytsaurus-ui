import cn from 'bem-cn-lite';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import type {RouteComponentProps} from 'react-router';

import NodeBundles from '../../../../../pages/components/tabs/node/NodeBundles/NodeBundles';
import NodeTables from '../../../../../pages/components/tabs/node/NodeTables/NodeTables';
import {loadNodeMemoryUsage} from '../../../../../store/actions/components/node/memory';
import {
    getNodeMemoryError,
    getNodeMemoryViewMode,
} from '../../../../../store/selectors/components/node/memory';
import Updater from '../../../../../utils/hammer/updater';
import ErrorBlock from '../../../../../components/Error/Error';
import NodeBundlesTotal from '../NodeBundlesTotal/NodeBundlesTotal';
import NodeMemoryUsageToolbar from './NodeMemoryUsageToolbar';

// import './MemoryUsage.scss';

const block = cn('node-memory-usage');
const updater = new Updater();

interface RouteParams {
    host: string;
}

interface Props extends RouteComponentProps<RouteParams> {}

function NodeMemoryUsage({match}: Props): ReturnType<React.VFC> {
    const dispatch = useDispatch();

    const error = useSelector(getNodeMemoryError);

    const host = decodeURIComponent(match.params.host);

    React.useEffect(() => {
        const loadHandler = () => dispatch(loadNodeMemoryUsage(host));

        updater.add('node-memory', loadHandler, 15 * 1000);

        return () => {
            updater.remove('node-memory');
            // dispatch(abortAndReset());
        };
    }, [dispatch, host]);

    const viewMode = useSelector(getNodeMemoryViewMode);

    return (
        <div className={block()}>
            <React.Fragment>
                {error && <ErrorBlock error={error} />}
                <NodeBundlesTotal />
                <NodeMemoryUsageToolbar />
                {viewMode === 'cells' ? <NodeBundles /> : <NodeTables />}
            </React.Fragment>
        </div>
    );
}

export default React.memo(NodeMemoryUsage);
