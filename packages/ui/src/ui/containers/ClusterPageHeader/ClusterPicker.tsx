import React, {FC, useCallback} from 'react';
import ClustersPanel, {ClusterGroupItem} from './ClustersPanel';
import Icon from '../../components/Icon/Icon';
import {ClusterConfig} from '../../../shared/yt-types';
import cn from 'bem-cn-lite';
import './ClusterPageHeader.scss';
import {Popup} from '@gravity-ui/uikit';
import {makeClusterUrl} from './helpers/makeClusterUrl';
import {getAppBrowserHistory} from '../../store/window-store';

const block = cn('cluster-page-header');

type Props = {
    cluster: string;
    clusterConfig: ClusterConfig;
};

export const ClusterPicker: FC<Props> = ({clusterConfig}) => {
    const [visible, setVisible] = React.useState(false);

    const toggleVisibility = useCallback(() => {
        setVisible((prevState) => !prevState);
    }, [setVisible]);

    const handleClosePopup = useCallback(() => {
        setVisible(false);
    }, [setVisible]);

    const handleSelectCluster = useCallback(
        (cluster: string) => {
            const url = makeClusterUrl(cluster);
            if (url) {
                getAppBrowserHistory().push(url);
            }
            handleClosePopup();
        },
        [handleClosePopup],
    );

    const iconRef = React.useRef<HTMLDivElement>(null);

    return (
        <div className={block('cluster')} onClick={toggleVisibility}>
            <ClusterGroupItem forwardImageRef={iconRef} {...clusterConfig} shortEnv />
            <Icon awesome={'chevron-down'} size="l" />
            <Popup
                className={block('popup')}
                placement={['bottom-start', 'top-start']}
                anchorRef={iconRef}
                open={visible}
                onClose={handleClosePopup}
                offset={[0, 5]}
            >
                {visible && (
                    <ClustersPanel
                        className={block('popup-content')}
                        onSelectCluster={handleSelectCluster}
                    />
                )}
            </Popup>
        </div>
    );
};
