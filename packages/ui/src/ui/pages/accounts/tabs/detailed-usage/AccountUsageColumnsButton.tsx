import React from 'react';
import _ from 'lodash';

import Button from '../../../../components/Button/Button';
import {
    getAccountUsageSelectableColumns,
    getAccountUsageVisibleDataColumns,
    readableAccountUsageColumnName,
} from '../../../../store/selectors/accounts/account-usage';
import {useDispatch, useSelector} from 'react-redux';
import ColumnSelectorModal from '../../../../components/ColumnSelectorModal/ColumnSelectorModal';
import {setAccountUsageColumns} from '../../../../store/actions/accounts/account-usage';
import {Secondary} from '../../../../components/Text/Text';

const AccountUsageColumnsDialogMemo = React.memo(AccountUsageColumnsDialog);

export default React.memo(AccountUsageColumnsButton);

function AccountUsageColumnsButton() {
    const [visible, setVisible] = React.useState(false);
    const toggleVisibility = React.useCallback(() => {
        setVisible(!visible);
    }, [visible, setVisible]);

    const handleClose = React.useCallback(() => {
        setVisible(false);
    }, [setVisible]);

    return (
        <React.Fragment>
            <Button onClick={toggleVisibility}>Columns</Button>
            <AccountUsageColumnsDialogMemo visible={visible} onClose={handleClose} />
        </React.Fragment>
    );
}

interface DialogProps {
    visible: boolean;
    onClose: () => void;
}

function AccountUsageColumnsDialog({visible, onClose}: DialogProps) {
    const dispatch = useDispatch();
    const visibleColumns = useSelector(getAccountUsageVisibleDataColumns);
    const availableColumns = useSelector(getAccountUsageSelectableColumns);

    const handleChange = React.useCallback((newValue: typeof value) => {
        const checked = _.filter(newValue, 'checked');
        dispatch(setAccountUsageColumns(_.map(checked, ({data: {caption}}) => caption)));
        onClose();
    }, []);

    const value = React.useMemo(() => {
        const available = new Set(availableColumns);
        const selected = visibleColumns.filter((item) => available.has(item as any));

        const selectedSet = new Set(selected);
        const other = availableColumns.filter((item) => !selectedSet.has(item));

        return _.map(selected.concat(other), (item) => {
            return {
                name: readableAccountUsageColumnName(item, true),
                checked: selectedSet.has(item),
                data: {
                    caption: item,
                    isMedium: item.startsWith('medium:'),
                },
            };
        });
    }, [availableColumns, visibleColumns]);

    return !visible ? null : (
        <ColumnSelectorModal
            isVisible={true}
            onCancel={onClose}
            onConfirm={handleChange}
            items={value}
            itemRenderer={(item) => {
                const {
                    name,
                    data: {isMedium, caption},
                } = item;
                return !isMedium ? (
                    name
                ) : (
                    <span>
                        <Secondary>Medium: </Secondary>
                        {readableAccountUsageColumnName(caption)}
                    </span>
                );
            }}
        />
    );
}
