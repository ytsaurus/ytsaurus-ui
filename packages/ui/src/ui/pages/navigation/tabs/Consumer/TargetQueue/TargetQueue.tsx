import React from 'react';
import cn from 'bem-cn-lite';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';

import {
    selectConsumerError,
    selectConsumerName,
    selectConsumerNames,
    selectConsumerRegisteredQueues,
    selectTargetQueue,
    selectTargetQueueError,
} from '../../../../../store/selectors/navigation/tabs/consumer';
import {YTErrorBlock} from '../../../../../containers/Block/Block';
import Icon from '../../../../../components/Icon/Icon';
import Link from '../../../../../containers/Link/Link';
import {findCommonPathParent, genNavigationUrl} from '../../../../../utils/navigation/navigation';
import {ClipboardButton, Tooltip} from '@ytsaurus/components';
import {type Item, SelectSingle} from '../../../../../components/Select/Select';
import {changeConsumerFilters} from '../../../../../store/actions/navigation/tabs/consumer/filters';
import {parseQueueRegistrationPath} from '../../../../../utils/navigation/queue-registration';

import i18n from './i18n';

import './TargetQueue.scss';

const block = cn('target-queue');

export default function TargetQueue() {
    const dispatch = useDispatch();
    const names = useSelector(selectConsumerNames);
    const name = useSelector(selectConsumerName);
    const consumerError = useSelector(selectConsumerError);
    const {queue} = useSelector(selectTargetQueue) ?? {};
    const error = useSelector(selectTargetQueueError);

    let clusterQueueUrl;
    if (queue) {
        const {cluster, path} = parseQueueRegistrationPath(queue);
        clusterQueueUrl = genNavigationUrl({cluster, path});
    }

    return (
        <div className={block()}>
            {names !== undefined && (
                <div className={block('consumer')}>
                    <div className="elements-heading elements-heading_size_xs">
                        {i18n('title_consumer-name')}
                    </div>
                    <SelectSingle
                        value={name}
                        items={names.map((value) => ({value, text: value}))}
                        onChange={(consumerName) =>
                            dispatch(changeConsumerFilters({consumerName, targetQueue: undefined}))
                        }
                        placeholder={i18n('action_select-consumer')}
                        width="auto"
                    />
                </div>
            )}
            {consumerError && <YTErrorBlock error={consumerError} topMargin="half" />}
            <div className="elements-heading elements-heading_size_xs">
                {i18n('title_target-queue')}
            </div>
            <ConsumerQueueSelector>
                {queue && (
                    <Link theme="secondary" url={clusterQueueUrl} routed>
                        <Icon awesome="link" />
                    </Link>
                )}
            </ConsumerQueueSelector>
            {error && <YTErrorBlock error={error} topMargin="half" />}
        </div>
    );
}

interface ConsumerQueueSelectorProps {
    className?: string;

    children?: React.ReactNode;
}

export function ConsumerQueueSelector({className, children}: ConsumerQueueSelectorProps) {
    const dispatch = useDispatch();
    const registrations = useSelector(selectConsumerRegisteredQueues);
    const isMultiConsumer = useSelector(selectConsumerNames) !== undefined;

    const handleSelect = (value?: string) => {
        const item = value ? registrations?.find(({queue}) => queue === value) : undefined;
        dispatch(changeConsumerFilters({targetQueue: item}));
    };

    const {prefix, items, renderItem} = React.useMemo(() => {
        const pref =
            registrations?.length === 1
                ? ''
                : reduce_(
                      registrations,
                      (acc, {queue}) => {
                          return findCommonPathParent(acc, queue);
                      },
                      registrations?.[0]?.queue ?? '',
                  );

        const options = map_(registrations, ({queue}) => {
            return {
                value: `${queue}`,
                text: queue,
            };
        });

        return {
            prefix: pref,
            items: options,
            renderItem: (item: Item) => {
                return item.value.slice(pref.length);
            },
        };
    }, [registrations]);

    const {queue} = useSelector(selectTargetQueue) ?? {};

    return (
        <div className={block('selector', className)}>
            {isMultiConsumer || items.length > 1 ? (
                <>
                    <Prefix text={prefix} />{' '}
                    <SelectSingle
                        value={queue}
                        items={items}
                        className={block('queue-selector-value')}
                        renderItem={renderItem}
                        width="auto"
                        onChange={handleSelect}
                        placeholder={i18n('action_select-queue')}
                    />
                </>
            ) : (
                <Prefix text={queue ?? ''} />
            )}
            {queue && <ClipboardButton text={queue} view="clear" />}
            {children}
        </div>
    );
}

function Prefix({text}: {text: string}) {
    const parts = text.split('/');

    return (
        <Tooltip className={block('prefix')} content={text}>
            {parts.map((item, index) => {
                return (
                    <React.Fragment key={index}>
                        {item && <span className={block('prefix-item')}>{item}</span>}
                        {index !== parts.length - 1 ? '/' : null}
                    </React.Fragment>
                );
            })}
        </Tooltip>
    );
}
