import React, {FC, useCallback} from 'react';
import AttributesButton from '../../../../components/AttributesButton/AttributesButton';
import {AccountUsageDataItem} from '../../../../store/reducers/accounts/usage/account-usage-types';

export type AccountRequestData = {
    cluster: string;
    row: AccountUsageDataItem;
};

type Props = AccountRequestData & {
    onAttributeButtonClick: (accountData: AccountRequestData) => void;
};

export const AccountActionsField: FC<Props> = ({cluster, row, onAttributeButtonClick}) => {
    const handleOpenAttributeModal = useCallback(() => {
        onAttributeButtonClick({cluster, row});
    }, [onAttributeButtonClick, row, cluster]);

    if (!row.path) return undefined;

    return (
        <AttributesButton
            view="flat"
            withTooltip
            tooltipProps={{placement: 'bottom-end', content: 'Show attributes'}}
            onClick={handleOpenAttributeModal}
            size="xs"
        />
    );
};
