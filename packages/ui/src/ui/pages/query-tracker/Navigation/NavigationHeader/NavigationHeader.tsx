import React, {FC} from 'react';
import cn from 'bem-cn-lite';
import './NavigationHeader.scss';
import {NavigationBreadcrumbs} from './NavigationBreadcrumbs';
import {HeaderActions} from './HeaderActions';
import {TextInput} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    selectNavigationFilter,
    selectNavigationNodeType,
} from '../../../../store/selectors/query-tracker/queryNavigation';
import {BodyType, setFilter} from '../../../../store/reducers/query-tracker/queryNavigationSlice';
import i18n from './i18n';

const b = cn('navigation-header');

export const NavigationHeader: FC = () => {
    const dispatch = useDispatch();
    const filter = useSelector(selectNavigationFilter);
    const nodeType = useSelector(selectNavigationNodeType);

    const showFilter = nodeType !== BodyType.Table;

    const handleFilterChange = (value: string) => {
        dispatch(setFilter(value));
    };

    return (
        <div className={b()}>
            <div className={b('path-wrap')}>
                <NavigationBreadcrumbs />
                <HeaderActions />
            </div>
            {showFilter && (
                <TextInput
                    value={filter}
                    placeholder={i18n('field_filter-by-name')}
                    onUpdate={handleFilterChange}
                    hasClear
                />
            )}
        </div>
    );
};
