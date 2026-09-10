import {connect} from 'react-redux';

import {abortAllRequests, getShards} from '../../../../store/actions/components/shards';

import './Shards.scss';
import {selectCluster} from '../../../../store/selectors/global';
import {type RootState} from '../../../../store/reducers';

import {ShardsBase} from './ShardsBase';

const mapStateToProps = (state: RootState) => {
    const {loading, loaded, error, errorData, shards} = state.components.shards;

    return {
        loading,
        loaded,
        error,
        errorData,
        shards,
        cluster: selectCluster(state),
    };
};

const mapDispatchToProps = {
    getShards,
    abortAllRequests,
};

const Shards = connect(mapStateToProps, mapDispatchToProps)(ShardsBase);

export default Shards;
