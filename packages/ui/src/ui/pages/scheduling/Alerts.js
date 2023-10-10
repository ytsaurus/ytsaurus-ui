import _ from 'lodash';
import React from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';

import CollapsibleSection from '../../components/CollapsibleSection/CollapsibleSection';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import Alert from '../../components/Alert/Alert';
import {getUISizes} from '../../store/selectors/global';

const block = cn('scheduling-alerts');

Alerts.propTypes = {
    className: PropTypes.string,
};

export default function Alerts({className}) {
    const {schedulerAlerts} = useSelector((state) => state.scheduling.scheduling);
    const {collapsibleSize} = useSelector(getUISizes);

    if (!schedulerAlerts?.length) {
        return null;
    }

    return (
        <ErrorBoundary>
            <div className={block(null, className)}>
                {!schedulerAlerts?.length ? null : (
                    <CollapsibleSection name="Alerts" size={collapsibleSize}>
                        {_.map(schedulerAlerts, (alert, index) => {
                            return <Alert key={index} error={alert} />;
                        })}
                    </CollapsibleSection>
                )}
            </div>
        </ErrorBoundary>
    );
}
