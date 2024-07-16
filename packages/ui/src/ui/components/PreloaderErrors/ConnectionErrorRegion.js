import React from 'react';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';
import Link from '../../components/Link/Link';

import withBlockedNavigation from '../../hocs/withBlockedNavigation';
import Button from '../Button/Button';
import {getGlobalError} from '../../store/selectors/global';
import {showErrorPopup} from '../../utils/utils';
import {isDocsAllowed} from '../../config';
import {uiSettings} from '../../config/ui-settings';
import UIFactory from '../../UIFactory';

const b = block('preloader');

const {announcesMailListUrl, sslCertFixUrl} = uiSettings;

export function ConnectionErrorRegion({cluster}) {
    const error = useSelector(getGlobalError);
    const clusterName = cluster.toUpperCase();

    const titleText = `${clusterName} couldn’t be reached`;
    const url = UIFactory.docsUrls['common:quotas#request_quota'];
    return (
        <section className={b('error')}>
            <h2 className={b('title')}>
                {error ? (
                    <Link className={b('error-details')} onClick={() => showErrorPopup(error)}>
                        {titleText}
                    </Link>
                ) : (
                    titleText
                )}
            </h2>

            {isDocsAllowed() && (
                <React.Fragment>
                    <ul className={b('suggestions-list')}>
                        <li className={b('suggestions-item')}>
                            <h2 className={b('suggestions-title')}>Install Internal CA</h2>
                            <p className={b('suggestions-text')}>
                                Our clusters are using Internal CA as a root SSL certificate. Please
                                make sure you have it{' '}
                                {sslCertFixUrl ? (
                                    <Link target="_blank" url={sslCertFixUrl}>
                                        installed in your browser
                                    </Link>
                                ) : (
                                    'installed in your browser'
                                )}
                                . This issue is the most common for Ubuntu machines.
                            </p>
                        </li>

                        <li className={b('suggestions-item')}>
                            <h2 className={b('suggestions-title')}>Check your permissions</h2>
                            <p className={b('suggestions-text')}>
                                You may lack permission to view {clusterName}.
                                {url !== '' ? (
                                    <>
                                        Please refer to{' '}
                                        <Link target="_blank" url={url}>
                                            Getting started
                                        </Link>
                                        .{' '}
                                    </>
                                ) : null}
                            </p>
                        </li>
                        {announcesMailListUrl && (
                            <li className={b('suggestions-item')}>
                                <h2 className={b('suggestions-title')}>
                                    Check cluster availability
                                </h2>
                                <p className={b('suggestions-text')}>
                                    Cluster may be temporarily unavailable. Please check <br />
                                    {
                                        <Link
                                            theme="normal"
                                            target="_blank"
                                            url={announcesMailListUrl}
                                        >
                                            yt-announces@
                                        </Link>
                                    }{' '}
                                    mailing list for relevant announcements.
                                </p>
                            </li>
                        )}
                    </ul>
                    {announcesMailListUrl && (
                        <Button
                            url={announcesMailListUrl}
                            target="_blank"
                            view="action"
                            type="link"
                            size="m"
                        >
                            Subscribe to YT announces
                        </Button>
                    )}
                </React.Fragment>
            )}
        </section>
    );
}

ConnectionErrorRegion.propTypes = {
    cluster: PropTypes.string,
    puncherUrl: PropTypes.string,
};

ConnectionErrorRegion.defaultProps = {
    cluster: 'Cluster',
};

export default withBlockedNavigation(ConnectionErrorRegion);
