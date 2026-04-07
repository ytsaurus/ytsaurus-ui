import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Redirect} from 'react-router';
import block from 'bem-cn-lite';
import i18n from './i18n';

const b = block('elements-message');

function BanPage({blocked, banned, cluster}) {
    const className = b('paragraph');

    return banned || blocked ? (
        <div className="elements-page__content">
            <div className="elements-main-section">
                {banned && (
                    <div className={b({theme: 'warning'})}>
                        <p className={className}>
                            {i18n('alert_banned_1')} <strong>{i18n('alert_banned_word')}</strong>{' '}
                            {i18n('alert_banned_2')}
                        </p>
                        <p className={className}>{i18n('alert_banned-report')}</p>
                    </div>
                )}
                {blocked && (
                    <div className={b({theme: 'warning'})}>
                        <p className={className}>{i18n('alert_blocked')}</p>
                        <p className={className}>{i18n('alert_blocked-transient')}</p>
                        <p className={className}>{i18n('alert_blocked-reload')}</p>
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
