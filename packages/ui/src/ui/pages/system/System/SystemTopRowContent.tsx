import React from 'react';
import cn from 'bem-cn-lite';

import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';
import {Page} from '../../../constants';
import Button from '../../../components/Button/Button';

import {getCurrentClusterConfig} from '../../../store/selectors/global';
import {useSelector} from '../../../store/redux-hooks';
import {ClusterConfig} from '../../../../shared/yt-types';
import UIFactory from '../../../UIFactory';

import './SystemTopRowContent.scss';

const block = cn('system-top-row-content');

function SystemTopRowContent() {
    return (
        <RowWithName className={block()} page={Page.SYSTEM}>
            <CreateClusterNotificationButton />
        </RowWithName>
    );
}

export function CreateClusterNotificationButton() {
    const clusterConfig = useSelector(getCurrentClusterConfig);
    return <CreateNotificationButton clusterConfig={clusterConfig} />;
}

export function CreateNotificationButton({clusterConfig}: {clusterConfig: ClusterConfig}) {
    const url = UIFactory.createNotificationUrl(clusterConfig);
    if (!url) {
        return null;
    }

    return (
        <div className={block('create-notification')}>
            <Button view="action" title="Create notification" href={url} target={'_blank'}>
                Create notification
            </Button>
        </div>
    );
}

export default React.memo(SystemTopRowContent);
