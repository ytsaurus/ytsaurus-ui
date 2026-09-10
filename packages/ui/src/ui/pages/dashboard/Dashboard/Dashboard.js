import {connect} from 'react-redux';
import {setActiveAccount} from '../../../store/actions/accounts/accounts';
import {selectActiveAccount} from '../../../store/selectors/accounts/accounts';

import './Dashboard.scss';

import {DashboardBase} from './DashboardBase';

const mapStateToProps = (state) => {
    return {
        currentAccount: selectActiveAccount(state),
    };
};

const Dashboard = connect(mapStateToProps, {setActiveAccount})(DashboardBase);

export default Dashboard;
