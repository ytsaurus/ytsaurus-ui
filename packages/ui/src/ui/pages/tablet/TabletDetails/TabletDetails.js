import {useDispatch, useSelector} from '../../../store/redux-hooks';
import React from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import LoadDataHandler from '../../../components/LoadDataHandler/LoadDataHandler';
import {Loader} from '@gravity-ui/uikit';

import Partitions from './Partitions';
import Overview from './Overview';

import {abortAndReset, loadTabletData} from '../../../store/actions/tablet/tablet';
import {useUpdater} from '../../../hooks/use-updater';

import './TabletDetails.scss';

const block = cn('tablet-details');

TabletDetails.propTypes = {
    // from react-router
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
    }),
};

function TabletDetails({match}) {
    const dispatch = useDispatch();

    const {loading, loaded, error, errorData} = useSelector((state) => state.tablet.tablet);
    const {id} = match.params;

    const {updateFn, destructFn} = React.useMemo(() => {
        return {
            updateFn: () => dispatch(loadTabletData(id)),
            destructFn: () => dispatch(abortAndReset()),
        };
    }, [dispatch, id]);

    useUpdater(updateFn, {timeout: 15 * 1000, destructFn});

    const initialLoading = loading && !loaded;

    return (
        <div className={block()}>
            <div className={block('content', {loading: initialLoading})}>
                {initialLoading ? (
                    <Loader />
                ) : (
                    <LoadDataHandler loaded={loaded} error={error} errorData={errorData}>
                        <Overview id={id} block={block} />
                        <Partitions block={block} />
                    </LoadDataHandler>
                )}
            </div>
        </div>
    );
}

export default TabletDetails;
