import React from 'react';
import cn from 'bem-cn-lite';
import _map from 'lodash/map';
import _reduce from 'lodash/reduce';
import {useDispatch, useSelector} from 'react-redux';

import {
    getConsumerRegisteredQueues,
    getTargetQueue,
} from '../../../../../store/selectors/navigation/tabs/consumer';
import Icon from '../../../../../components/Icon/Icon';
import Link from '../../../../../components/Link/Link';
import {findCommonPathParent, genNavigationUrl} from '../../../../../utils/navigation/navigation';
import ClipboardButton from '../../../../../components/ClipboardButton/ClipboardButton';
import {Item, SelectSingle} from '../../../../../components/Select/Select';
import {Tooltip} from '../../../../../components/Tooltip/Tooltip';
import {changeConsumerFilters} from '../../../../../store/actions/navigation/tabs/consumer/filters';

import './TargetQueue.scss';

const block = cn('target-queue');

export default function TargetQueue() {
    const {queue} = useSelector(getTargetQueue) ?? {};

    let clusterQueueUrl;
    if (queue) {
        const firstColon = queue.indexOf(':');
        if (firstColon === -1) {
            throw new Error(
                'Unexpected behavior: queue should be formatted like "${cluster}:${path}"',
            );
        }
        const cluster = queue.slice(0, firstColon);
        const path = queue.slice(firstColon + 1);
        clusterQueueUrl = genNavigationUrl(cluster, path);
    }

    return (
        <div className={block()}>
            <div className="elements-heading elements-heading_size_xs">Target queue</div>
            <ConsumerQueueSelector>
                {queue && (
                    <Link theme="secondary" url={clusterQueueUrl} routed>
                        <Icon awesome="link" />
                    </Link>
                )}
            </ConsumerQueueSelector>
        </div>
    );
}

interface ConsumerQueueSelectorProps {
    className?: string;

    children?: React.ReactNode;
}

export function ConsumerQueueSelector({className, children}: ConsumerQueueSelectorProps) {
    const dispatch = useDispatch();
    const registrations = useSelector(getConsumerRegisteredQueues);

    const handleSelect = (value?: string) => {
        const item = value ? registrations?.find(({queue}) => queue === value) : undefined;
        dispatch(changeConsumerFilters({targetQueue: item}));
    };

    const {prefix, items, renderItem} = React.useMemo(() => {
        const pref = _reduce(
            registrations,
            (acc, {queue}) => {
                return findCommonPathParent(acc, queue);
            },
            registrations?.[0]?.queue ?? '',
        );

        const options = _map(registrations, ({queue}) => {
            return {
                value: `${queue}`,
                text: queue,
            };
        });

        if (options.length === 1) {
            const [{value}] = options;
            requestAnimationFrame(() => {
                handleSelect(value);
            });
        }

        return {
            prefix: pref,
            items: options,
            renderItem: (item: Item) => {
                return item.value.slice(pref.length);
            },
        };
    }, [registrations, dispatch]);

    const {queue} = useSelector(getTargetQueue) ?? {};

    return (
        <div className={block('selector', className)}>
            {items.length > 1 ? (
                <>
                    <Prefix text={prefix} />{' '}
                    <SelectSingle
                        value={queue}
                        items={items}
                        className={block('queue-selector-value')}
                        renderItem={renderItem}
                        width="auto"
                        onChange={handleSelect}
                        placeholder="Select queue... "
                        disablePortal={false}
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
