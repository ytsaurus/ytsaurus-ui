import React from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import {connect, useSelector} from 'react-redux';
import {setActiveAccount} from '../../../store/actions/accounts/accounts';

import Operations from '../../../pages/operations/Operations/Operations';
import {getActiveAccount} from '../../../store/selectors/accounts/accounts';
import Links from '../Links/Links';
import AccountsGeneralTab from '../../../pages/accounts/tabs/general/AccountsGeneralTab';
import {DASHBOARD_VIEW_CONTEXT} from '../../../constants/index';
import AccountsUpdater from '../../accounts/Accounts/AccountsUpdater';
import {getCluster, getCurrentUserName} from '../../../store/selectors/global';
import UIFactory from '../../../UIFactory';

import './Dashboard.scss';

const block = cn('dashboard');
const headingBlock = cn('elements-heading');

Dashboard.propTypes = {
    currentAccount: PropTypes.string.isRequired,
    setActiveAccount: PropTypes.func.isRequired,
};

function MyRolesLink() {
    const login = useSelector(getCurrentUserName);
    const cluster = useSelector(getCluster);

    return (
        UIFactory.renderRolesLink({
            login,
            cluster,
            className: block('idm-roles-link'),
        }) ?? null
    );
}

function Dashboard({currentAccount, setActiveAccount}) {
    React.useEffect(() => {
        if (currentAccount) {
            setActiveAccount('');
        }
    }, [currentAccount, setActiveAccount]);

    const size = 'm';

    return (
        <div className={block()}>
            <div className="elements-main-section">
                <div className={'elements-section'}>
                    <div className={headingBlock({size}, block('links-header'))}>
                        <span>Links</span>
                        <div className={block('idm-roles')}>
                            <MyRolesLink />
                        </div>
                    </div>
                    <Links />
                </div>

                <div className={'elements-section'}>
                    <div className={headingBlock({size}, block('operations-header'))}>
                        Operations
                    </div>
                    <Operations viewContext={DASHBOARD_VIEW_CONTEXT} />
                </div>

                <div className={'elements-section'}>
                    <div className={headingBlock({size})}>Accounts</div>
                    <AccountsUpdater />
                    <AccountsGeneralTab viewContext={DASHBOARD_VIEW_CONTEXT} />
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        currentAccount: getActiveAccount(state),
    };
};

export default connect(mapStateToProps, {setActiveAccount})(Dashboard);
