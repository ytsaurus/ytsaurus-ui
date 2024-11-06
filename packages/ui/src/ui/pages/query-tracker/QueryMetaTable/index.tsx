import React, {useMemo, useState} from 'react';
import block from 'bem-cn-lite';
import hammer from '../../../common/hammer';

import './index.scss';
import {QueryItem} from '../module/api';
import {Button} from '@gravity-ui/uikit';
import Yson from '../../../components/Yson/Yson';
import SimpleModal from '../../../components/Modal/SimpleModal';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';

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
    showCopy: boolean;
};

const exceptFields: (keyof QueryItem | 'access_control_object')[] = [
    'query',
    'access_control_object',
];

const FIELD_WITH_COPY_BUTTON = 'id';

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

                let finalValue = value;
                if (isObject) {
                    finalValue = (
                        <Button
                            view="outlined"
                            onClick={() => {
                                setSelectedOption(value);
                                setModalOpened(true);
                            }}
                        >
                            View details
                        </Button>
                    );
                }

                return {
                    title,
                    value: finalValue,
                    showCopy: FIELD_WITH_COPY_BUTTON === title,
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
                                    {item.showCopy && (
                                        <ClipboardButton
                                            size="s"
                                            text={value}
                                            inlineMargins={true}
                                        />
                                    )}
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
