import React from 'react';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import CustomRadioButton from '../../../../../components/RadioButton/RadioButton';
import {
    selectNodeMemoryFilter,
    selectNodeMemoryViewMode,
} from '../../../../../store/selectors/components/node/memory';
import {setNodeMemoryFilters} from '../../../../../store/actions/components/node/memory';
import Filter from '../../../../../components/Filter/Filter';
import i18n from './i18n';

import './NodeMemoryUsageToolbar.scss';

const block = cn('node-memory-usage-toolbar');

function NodeMemoryUsageToolbar() {
    const dispatch = useDispatch();
    const viewMode = useSelector(selectNodeMemoryViewMode);
    const filter = useSelector(selectNodeMemoryFilter);

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
                            ? i18n('placeholder_filter-cells')
                            : i18n('placeholder_filter-tables')
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
                        get text() {
                            return i18n('value_tables');
                        },
                    },
                    {
                        value: 'cells',
                        get text() {
                            return i18n('value_bundles-and-cells');
                        },
                    },
                ]}
            />
        </div>
    );
}

export default React.memo(NodeMemoryUsageToolbar);
