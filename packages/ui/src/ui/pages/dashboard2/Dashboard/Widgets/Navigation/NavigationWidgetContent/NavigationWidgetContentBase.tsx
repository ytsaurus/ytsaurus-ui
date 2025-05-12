import React, {useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import b from 'bem-cn-lite';
import {Flex, Text} from '@gravity-ui/uikit';

import forEach_ from 'lodash/forEach';
import includes_ from 'lodash/includes';
import indexOf_ from 'lodash/indexOf';

import {getCluster} from '../../../../../../store/selectors/global';

import Icon from '../../../../../../components/Icon/Icon';
import Link from '../../../../../../components/Link/Link';

import {getIconNameForType} from '../../../../../../utils/navigation/path-editor';
import {Page} from '../../../../../../../shared/constants/settings';

import './NavigationWidgetContent.scss';

const block = b('yt-navigation-widget-content');

const TRASH_PATH = '//tmp/trash';

type NavigationItem = {
    type: string;
    path: string;
    targetPath?: string;
};

type Props = {
    items: NavigationItem[];
};

export function NavigationWidgetContentBase(props: Props) {
    const {items} = props;

    const containerRef = useRef(null);
    const [visibleItems, setVisibleItems] = useState<(string | undefined)[]>([]);
    const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});

    useEffect(() => {
        if (!containerRef.current) return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                setVisibleItems((prevVisible) => {
                    const newVisible = [...prevVisible];

                    forEach_(entries, (entry) => {
                        const id = (entry.target as HTMLElement).dataset.id;
                        const isFullyVisible = entry.intersectionRatio === 1;

                        if (isFullyVisible && !includes_(newVisible, id)) {
                            newVisible.push(id);
                        } else if (!isFullyVisible && includes_(newVisible, id)) {
                            const index = indexOf_(newVisible, id);

                            if (index !== -1) {
                                newVisible.splice(index, 1);
                            }
                        }
                    });
                    return newVisible;
                });
            },
            {
                root: containerRef.current,
                threshold: 1.0,
            },
        );

        forEach_(Object.values(itemRefs.current), (el) => {
            if (el instanceof Element) {
                observer.observe(el);
            }
        });
        return () => {
            observer.disconnect();
        };
    }, [items, visibleItems.length]);

    return (
        <Flex ref={containerRef} className={block('list')} direction={'column'}>
            {items.map((item, idx) => (
                <div
                    key={idx}
                    data-id={idx}
                    ref={(el: HTMLDivElement | null) => {
                        itemRefs.current[idx] = el;
                    }}
                    style={{
                        visibility: includes_(visibleItems, String(idx)) ? 'visible' : 'hidden',
                    }}
                >
                    {idx !== 0 && (
                        <div style={{borderBottom: '1px solid var(--g-color-line-generic)'}}></div>
                    )}
                    <Item {...item} />
                </div>
            ))}
        </Flex>
    );
}

function Item(item: NavigationItem) {
    const cluster = useSelector(getCluster);
    const url = `/${cluster}/${Page.NAVIGATION}?path=${item.path}`;

    return (
        <Flex direction={'row'} gap={4} alignItems={'center'} className={block('navigation-item')}>
            <MapNodesIcon {...item} />
            <Text whiteSpace={'nowrap'} ellipsis>
                <Link url={url} theme={'primary'} routed>
                    {item.path}
                </Link>
            </Text>
        </Flex>
    );
}

const isTrashNode = (item: NavigationItem) => {
    return item.path === TRASH_PATH;
};

const isLinkToTrashNode = (item: NavigationItem) => {
    return item.targetPath === TRASH_PATH;
};

function MapNodesIcon(item: NavigationItem) {
    let icon = <Icon awesome={'not-suported'} />;
    if (isTrashNode(item) || isLinkToTrashNode(item)) {
        icon = <Icon awesome={'trash-alt'} />;
    } else {
        icon = <Icon awesome={getIconNameForType(item.type)} />;
    }

    return icon;
}
