import {FC, useMemo} from 'react';
import cn from 'bem-cn-lite';
import type {NavigationTableMeta} from '../../types';
import './MetaTab.scss';

type MetaTabProps = {
    items: NavigationTableMeta[][];
};

const b = cn('navigation-table-meta');

export const MetaTab: FC<MetaTabProps> = ({items}) => {
    const visibleRows = useMemo(
        () =>
            items.map((row) =>
                row
                    .filter((item) => item.visible !== false)
                    .map((item) => (
                        <div key={item.key} className={b('row')}>
                            <span className={b('key')}>{item.key}</span>
                            <span className={b('value')}>
                                {typeof item.value === 'boolean' ? String(item.value) : item.value}
                            </span>
                        </div>
                    )),
            ),
        [items],
    );

    return (
        <div className={b()}>
            {visibleRows.map((row, rowIndex) => (
                <div key={rowIndex} className={b('group')}>
                    {row}
                </div>
            ))}
        </div>
    );
};
