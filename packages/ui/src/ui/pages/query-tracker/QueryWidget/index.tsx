import React, {useCallback, useState} from 'react';
import cn from 'bem-cn-lite';
import {QueryEditor} from '../QueryEditor/QueryEditor';
import {QueryMetaForm} from '../QueryTrackerTopRow/QueryMetaForm';
import Icon from '../../../components/Icon/Icon';
import {useSelector} from 'react-redux';
import {getCluster} from '../../../store/selectors/global';
import {createQueryUrl} from '../utils/navigation';
import {Button} from '@gravity-ui/uikit';
import {QueryTrackerNewButton} from '../QueryTrackerNewButton';
import './index.scss';

const block = cn('query-widget');

export type QueryWidgetProps = {onClose: () => void};

export function QueryWidget({onClose}: QueryWidgetProps) {
    const cluster = useSelector(getCluster);
    const [queryId, setQueryId] = useState<string | null>(null);
    const onStartQuery = useCallback(
        (query: string) => {
            setQueryId(query);
        },
        [setQueryId],
    );
    return (
        <div className={block()}>
            <div className={block('header')}>
                <QueryMetaForm className={block('meta-form')} />
                <div className={block('header-controls')}>
                    <div className={block('header-control-left')}>
                        {queryId && (
                            <Button
                                className={block('control')}
                                view="outlined"
                                href={createQueryUrl(cluster, queryId)}
                                target="_blank"
                            >
                                <Icon awesome="external-link" />
                                Open query
                            </Button>
                        )}
                    </div>
                    <div className={block('header-control-right')}>
                        <QueryTrackerNewButton
                            className={block('control')}
                            renderDefaultTitle={({engineTitle}) => (
                                <>Open query in {engineTitle} syntax</>
                            )}
                            cluster={cluster}
                            target="_blank"
                        />
                        <Button view="flat" className={block('control')} onClick={onClose}>
                            <Icon awesome="times" />
                        </Button>
                    </div>
                </div>
            </div>
            <QueryEditor onStartQuery={onStartQuery} />
        </div>
    );
}
