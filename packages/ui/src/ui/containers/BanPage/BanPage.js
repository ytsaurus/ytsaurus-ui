import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Redirect} from 'react-router';
import block from 'bem-cn-lite';

const b = block('elements-message');

function BanPage({blocked, banned, cluster}) {
    const className = b('paragraph');

    return banned || blocked ? (
        <div className="elements-page__content">
            <div className="elements-main-section">
                {banned && (
                    <div className={b({theme: 'warning'})}>
                        <p className={className}>
                            Unfortunately, you have been <strong>banned</strong> on this cluster.
                        </p>
                        <p className={className}>
                            If the problem persists please report it via Bug Reporter.
                        </p>
                    </div>
                )}
                {blocked && (
                    <div className={b({theme: 'warning'})}>
                        <p className={className}>
                            Unfortunately, you have exceeded the limit for the number of concurrent
                            requests.
                        </p>
                        <p className={className}>
                            Usually this is a transient failure due to load spikes.
                        </p>
                        <p className={className}>
                            Please, try reloading the page in a few minutes or reducing the load.
                        </p>
                    </div>
                )}
            </div>
        </div>
    ) : (
        <Redirect to={`/${cluster}/`} />
    );
}

BanPage.propTypes = {
    blocked: PropTypes.bool,
    banned: PropTypes.bool,
    cluster: PropTypes.string.isRequired,
};

function mapStateToProps({global}) {
    const {banned, blocked, cluster} = global;
    return {banned, blocked, cluster};
}

export default connect(mapStateToProps)(BanPage);
