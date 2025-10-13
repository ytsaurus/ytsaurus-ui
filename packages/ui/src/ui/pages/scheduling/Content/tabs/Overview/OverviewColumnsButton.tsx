import React from 'react';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';

import Button from '../../../../../components/Button/Button';
import ColumnSelectorModal from '../../../../../components/ColumnSelectorModal/ColumnSelectorModal';

import {getSchedulingOverivewColumns} from '../../../../../store/selectors/scheduling/overview-columns';
import {
    OVERVIEW_AVAILABLE_COLUMNS,
    getOverviewColumnTitle,
} from '../../../../../utils/scheduling/overviewTable';
import {setSettingByKey} from '../../../../../store/actions/settings';

export function OverviewColumnsButton({className}: {className?: string}) {
    const dispatch = useDispatch();

    const [visible, setVisible] = React.useState(false);

    const visibleColumns = useSelector(getSchedulingOverivewColumns);
    const items = React.useMemo(() => {
        const visibleColumnSet = new Set(visibleColumns);
        return [
            ...visibleColumns
                .filter((c) => c !== 'name' && c !== 'actions')
                .map((i) => {
                    return {name: getOverviewColumnTitle(i), checked: true, data: {column: i}};
                }),
            ...OVERVIEW_AVAILABLE_COLUMNS.filter((c) => c !== 'name' && c !== 'actions')
                .filter((i) => !visibleColumnSet.has(i))
                .map((i) => {
                    return {name: getOverviewColumnTitle(i), checked: false, data: {column: i}};
                }),
        ];
    }, [visibleColumns]);

    const dialog = !visible ? null : (
        <ColumnSelectorModal
            isVisible={visible}
            items={items}
            onConfirm={(value) => {
                const newColumns = value.filter((i) => i.checked).map((i) => i.data.column);
                dispatch(setSettingByKey('global::scheduling::overviewColumns', newColumns));
                setVisible(false);
            }}
            onCancel={() => setVisible(false)}
        />
    );

    return (
        <React.Fragment>
            {dialog}
            <Button className={className} onClick={() => setVisible(true)}>
                Columns
            </Button>
        </React.Fragment>
    );
}
