import React from 'react';
import cn from 'bem-cn-lite';
import {QueryEditor} from '../QueryEditor/QueryEditor';
import {QueryMetaForm} from '../QueryTrackerTopRow/QueryMetaForm/QueryMetaForm';
import Icon from '../../../components/Icon/Icon';
import {useSelector} from 'react-redux';
import {getCluster} from '../../../store/selectors/global';
import {Button} from '@gravity-ui/uikit';
import {QueryTrackerOpenButton} from '../QueryTrackerOpenButton/QueryTrackerOpenButton';
import {getPath} from '../../../store/selectors/navigation';
import './index.scss';

const block = cn('query-widget');

export type QueryWidgetProps = {onClose: () => void};

export function QueryWidget({onClose}: QueryWidgetProps) {
    const cluster = useSelector(getCluster);
    const path = useSelector(getPath);
    return (
        <div className={block()}>
            <div className={block('header')}>
                <QueryMetaForm className={block('meta-form')} cluster={cluster} path={path} />
                <div className={block('header-controls')}>
                    <div className={block('header-control-left')}>
                        <QueryTrackerOpenButton
                            className={block('control')}
                            cluster={cluster}
                            path={path}
                        />
                    </div>
                    <div className={block('header-control-right')}>
                        <Button view="flat" className={block('control')} onClick={onClose} size="l">
                            <Icon awesome="times" size={16} />
                        </Button>
                    </div>
                </div>
            </div>
            <QueryEditor />
        </div>
    );
}
