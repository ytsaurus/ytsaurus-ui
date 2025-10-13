import React from 'react';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import CustomRadioButton from '../../../../../components/RadioButton/RadioButton';
import {
    getNodeMemoryFilter,
    getNodeMemoryViewMode,
} from '../../../../../store/selectors/components/node/memory';
import {setNodeMemoryFilters} from '../../../../../store/actions/components/node/memory';
import Filter from '../../../../../components/Filter/Filter';

import './NodeMemoryUsageToolbar.scss';

const block = cn('node-memory-usage-toolbar');

function NodeMemoryUsageToolbar() {
    const dispatch = useDispatch();
    const viewMode = useSelector(getNodeMemoryViewMode);
    const filter = useSelector(getNodeMemoryFilter);

    const handleViewMode = React.useCallback((value: string) => {
        dispatch(
            setNodeMemoryFilters({
                viewMode: value as typeof viewMode,
            }),
        );
    }, []);

    const handleFilter = React.useCallback((filter: string) => {
        dispatch(setNodeMemoryFilters({filter}));
    }, []);

    return (
        <div className={block(null, 'elements-section')}>
            <div className={block('filter')}>
                <Filter
                    value={filter}
                    onChange={handleFilter}
                    placeholder={
                        viewMode === 'cells'
                            ? 'Filter by Bundle, Cell id...'
                            : 'Filter by Bundle, Path...'
                    }
                />
            </div>
            <CustomRadioButton
                size="m"
                value={viewMode}
                onUpdate={handleViewMode}
                name="navigation-tablets-mode"
                items={[
                    {
                        value: 'tables',
                        text: 'Tables',
                    },
                    {
                        value: 'cells',
                        text: 'Bundles and cells',
                    },
                ]}
            />
        </div>
    );
}

export default React.memo(NodeMemoryUsageToolbar);
