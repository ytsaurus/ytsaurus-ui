import React from 'react';
import cn from 'bem-cn-lite';
import {Button, Flex} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import Icon from '../../../components/Icon/Icon';
import {getCluster} from '../../../store/selectors/global';
import {getPath} from '../../../store/selectors/navigation';
import {QueryEditor} from '../QueryEditor';
import {QueryMetaForm} from './QueryMetaForm';
import {QueriesPooling} from '../hooks/QueriesPooling/context';
import {createQueryFromTablePath} from '../module/query/actions';
import {QueryEngine} from '../../../../shared/constants/engines';

import './index.scss';

const block = cn('query-widget');

export type QueryWidgetProps = {onClose: () => void};

export default function QueryWidget({onClose}: QueryWidgetProps) {
    const dispatch = useDispatch();
    const cluster = useSelector(getCluster);
    const path = useSelector(getPath);

    const handleClickOnNewQueryButton = () => {
        dispatch(createQueryFromTablePath(QueryEngine.YQL, cluster, path));
    };

    return (
        <div className={block()}>
            <QueriesPooling>
                <Flex
                    alignItems="center"
                    justifyContent="space-between"
                    className={block('header')}
                >
                    <QueryMetaForm
                        onClickOnNewQueryButton={handleClickOnNewQueryButton}
                        className={block('meta-form')}
                        cluster={cluster}
                        path={path}
                    />
                    <Button view="flat" className={block('control')} onClick={onClose} size="l">
                        <Icon awesome="times" size={16} />
                    </Button>
                </Flex>
                <QueryEditor />
            </QueriesPooling>
        </div>
    );
}
