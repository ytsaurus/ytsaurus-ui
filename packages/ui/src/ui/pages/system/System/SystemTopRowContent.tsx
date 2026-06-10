import React from 'react';
import cn from 'bem-cn-lite';

import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';
import {Page} from '../../../constants';
import Button from '../../../components/Button/Button';

import {selectCurrentClusterConfig} from '../../../store/selectors/global';
import {useSelector} from '../../../store/redux-hooks';
import {type ClusterConfig} from '../../../../shared/yt-types';
import UIFactory from '../../../UIFactory';

import i18n from './i18n';

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
    const clusterConfig = useSelector(selectCurrentClusterConfig);
    return <CreateNotificationButton clusterConfig={clusterConfig} />;
}

export function CreateNotificationButton({clusterConfig}: {clusterConfig: ClusterConfig}) {
    const url = UIFactory.createNotificationUrl(clusterConfig);
    if (!url) {
        return null;
    }

    return (
        <div className={block('create-notification')}>
            <Button view="action" title={i18n('action_create-notification')} href={url} target={'_blank'}>
                {i18n('action_create-notification')}
            </Button>
        </div>
    );
}

export default React.memo(SystemTopRowContent);
