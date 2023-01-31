import React from 'react';
import cn from 'bem-cn-lite';

import {matchPath} from 'react-router';
import {makeRoutedURL} from '../../store/location';

import {ClusterConfig} from '../../../shared/yt-types';
import Icon from '../../components/Icon/Icon';
import ClustersPanel, {ClusterGroupItem} from './ClustersPanel';

import {Popup} from '@gravity-ui/uikit';

import TopRowContent from '../AppNavigation/TopRowContent/TopRowContent';
import {useSelector} from 'react-redux';

import './ClusterPageHeader.scss';
import {getCluster, getCurrentClusterConfig} from '../../store/selectors/global';
import {getAppBrowserHistory} from '../../store/window-store';
const block = cn('cluster-page-header');

interface Props {
    cluster: string;
    clusterConfig: ClusterConfig;
}

function ClusterPageHeader() {
    const cluster = useSelector(getCluster);
    const clusterConfig = useSelector(getCurrentClusterConfig);

    return (
        <div className={block()}>
            <ClusterPicker cluster={cluster} clusterConfig={clusterConfig} />
            <div className={block('spacer')} />
            <TopRowContent />
        </div>
    );
}

export default React.memo(ClusterPageHeader);

function ClusterPicker(props: Props) {
    const {clusterConfig} = props;

    const [visible, setVisible] = React.useState(false);

    const toggleVisibility = React.useCallback(() => {
        setVisible(!visible);
    }, [setVisible, visible]);

    const closePopup = React.useCallback(() => {
        setVisible(false);
    }, [setVisible]);

    const iconRef = React.useRef(null);

    return (
        <div className={block('cluster')} onClick={toggleVisibility}>
            <ClusterGroupItem forwardImageRef={iconRef} {...clusterConfig} shortEnv />
            <Icon awesome={'chevron-down'} />
            <ClustersPopup anchor={iconRef} visible={visible} onClose={closePopup} />
        </div>
    );
}

interface PopupProps {
    visible: boolean;
    anchor: React.RefObject<any>;
    onClose: () => void;
}

function ClustersPopup(props: PopupProps) {
    const {anchor, visible, onClose} = props;

    const onSelect = React.useCallback(
        (cluster: string) => {
            const match = matchPath(window.location.pathname, {
                path: '/:cluster/:page',
            });
            if (!match) {
                return;
            }

            const oldUrl = makeRoutedURL(window.location.pathname);
            const [empty, oldCluster, ...rest] = oldUrl.split('/');
            if (oldCluster === cluster) {
                onClose();
                return;
            }

            const url = [empty, cluster, ...rest].join('/');
            getAppBrowserHistory().push(url);
            onClose();
        },
        [onClose],
    );

    return (
        <Popup
            className={block('popup')}
            placement={['bottom-start', 'top-start']}
            anchorRef={anchor}
            open={visible}
            onClose={onClose}
            offset={[0, 5]}
        >
            {visible && (
                <ClustersPanel className={block('popup-content')} onSelectCluster={onSelect} />
            )}
        </Popup>
    );
}
