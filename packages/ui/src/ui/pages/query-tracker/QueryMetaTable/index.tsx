import React, {useMemo, useState} from 'react';
import block from 'bem-cn-lite';
import hammer from '../../../common/hammer';

import './index.scss';
import {QueryItem} from '../module/api';
import {Button} from '@gravity-ui/uikit';
import Yson from '../../../components/Yson/Yson';
import SimpleModal from '../../../components/Modal/SimpleModal';

interface MetaTableProps {
    query: QueryItem;
    className?: string;
}

const b = block('query-meta-table');

const titleClassName = b('title');
const valueClassName = b('value');

type QueryMetaItem = {
    title: string;
    value: string | number | boolean;
};

const exceptFields: (keyof QueryItem)[] = ['query'];

export default function QueryMetaTable({query, className}: MetaTableProps) {
    const [selectedOption, setSelectedOption] = useState<Record<string, unknown> | null>(null);
    const [modalOpened, setModalOpened] = useState<boolean>(false);

    const items: QueryMetaItem[] = useMemo(() => {
        return Object.entries(query)
            .filter(([key]) => {
                return !exceptFields.includes(key as keyof QueryItem);
            })
            .map(([title, value]) => {
                const isObject = typeof value === 'object';
                return {
                    title,
                    value: isObject ? (
                        <Button
                            view="outlined"
                            onClick={() => {
                                setSelectedOption(value);
                                setModalOpened(true);
                            }}
                        >
                            View detals
                        </Button>
                    ) : (
                        value
                    ),
                };
            });
    }, [query]);

    return (
        <>
            <dl className={b(null, className)}>
                {items.map((item) => {
                    const valueItems = Array.isArray(item.value) ? item.value : [item.value];
                    return (
                        <React.Fragment key={item.title}>
                            <dt className={titleClassName}>{hammer.format.Readable(item.title)}</dt>
                            {valueItems.map((value, index) => (
                                <dd key={index} className={valueClassName}>
                                    {typeof value === 'boolean' ? String(value) : value}
                                </dd>
                            ))}
                        </React.Fragment>
                    );
                })}
            </dl>
            <SimpleModal
                visible={modalOpened}
                disableBodyScrollLock
                onOutsideClick={() => setModalOpened(false)}
                onCancel={() => setModalOpened(false)}
            >
                {selectedOption && <Yson value={selectedOption} settings={{}}></Yson>}
            </SimpleModal>
        </>
    );
}
