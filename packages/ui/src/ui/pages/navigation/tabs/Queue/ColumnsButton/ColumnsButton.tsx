// YTFRONT-3327-column-button
import React, {useMemo} from 'react';

import Button from '../../../../../components/Button/Button';
import ColumnSelectorModal from '../../../../../components/ColumnSelectorModal/ColumnSelectorModal';

export interface Props {
    allColumns: Array<{key: string; name: string}>;
    selectedColumns: string[];
    onChange(columns: string[]): void;
}

const ColumnsButton: React.VFC<Props> = ({allColumns, selectedColumns, onChange}) => {
    const [visible, setVisible] = React.useState(false);

    const items = useMemo(() => {
        const selectedSet = new Set(selectedColumns);
        const allColumnsMap = new Map(
            allColumns.map(({key, ...rest}) => [
                key,
                {...rest, checked: selectedSet.has(key), data: {key}},
            ]),
        );

        return [
            ...selectedColumns.filter((key) => allColumnsMap.has(key)),
            ...allColumns.filter((x) => !selectedSet.has(x.key)).map((x) => x.key),
        ].map((key) => allColumnsMap.get(key)!);
    }, [allColumns, selectedColumns]);

    const toggleVisibility = React.useCallback(() => {
        setVisible((x) => !x);
    }, [setVisible]);

    const handleClose = React.useCallback(() => {
        setVisible(false);
    }, [setVisible]);

    const handleChange = React.useCallback(
        (newValue: typeof items) => {
            onChange(newValue.filter((x) => x.checked).map((x) => x.data.key));
        },
        [onChange],
    );

    return (
        <>
            <Button onClick={toggleVisibility}>Columns</Button>
            <ColumnSelectorModal
                isVisible={visible}
                onCancel={handleClose}
                onConfirm={handleChange}
                items={items}
            />
        </>
    );
};

export default React.memo(ColumnsButton);
