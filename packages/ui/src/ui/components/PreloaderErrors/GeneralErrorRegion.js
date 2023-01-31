import React from 'react';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';

import {Support} from '../../components/Support/Support';
import withBlockedNavigation from '../../hocs/withBlockedNavigation';
import Button from '../Button/Button';
import Link from '../Link/Link';
import {getGlobalError} from '../../store/selectors/global';
import {showErrorPopup} from '../../utils/utils';

const b = block('preloader');

export function GeneralErrorRegion({message}) {
    const error = useSelector(getGlobalError);

    return (
        <section className={b('error')}>
            <h2 className={b('title')}>
                {error ? (
                    <Link className={b('error-details')} onClick={() => showErrorPopup(error)}>
                        Error
                    </Link>
                ) : (
                    'Error'
                )}
            </h2>

            <p className={b('text')}>{message}</p>

            <Support>
                <Button view="action" size="m">
                    Report bug
                </Button>
            </Support>
        </section>
    );
}

GeneralErrorRegion.propTypes = {
    cluster: PropTypes.string,
    message: PropTypes.string,
};

GeneralErrorRegion.defaultProps = {
    cluster: 'Cluster',
    message: 'Oops! Something went wrong. If problem persists please report it via Bug Reporter.',
};

export default withBlockedNavigation(GeneralErrorRegion);
