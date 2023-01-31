import {useDispatch, useSelector} from 'react-redux';
import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import LoadDataHandler from '../../../components/LoadDataHandler/LoadDataHandler';
import {Loader} from '@gravity-ui/uikit';

import Partitions from './Partitions';
import Overview from './Overview';

import {abortAndReset, loadTabletData} from '../../../store/actions/tablet/tablet';
import Updater from '../../../utils/hammer/updater';

import './TabletDetails.scss';

const block = cn('tablet-details');
const updater = new Updater();

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

    const loadHandler = () => dispatch(loadTabletData(id));

    useEffect(() => {
        updater.add('tablet', loadHandler, 15 * 1000);

        return () => {
            updater.remove('tablet');
            dispatch(abortAndReset());
        };
    }, [dispatch, id]);

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
