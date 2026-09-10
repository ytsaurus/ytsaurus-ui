import {connect} from 'react-redux';

import {abortAndReset, loadStoresData} from '../../../../store/actions/tablet/stores';
import {selectStores} from '../../../../store/selectors/tablet/stores';
import '../Stores.scss';

import {StoresBase} from './StoresBase';

const mapStateToProps = (state) => {
    const {loading, loaded, error, errorData} = state.tablet.stores;
    const stores = selectStores(state);

    return {loading, loaded, error, errorData, stores};
};

const mapDispatchToProps = {
    loadStoresData,
    abortAndReset,
};

export const Stores = connect(mapStateToProps, mapDispatchToProps)(StoresBase);
