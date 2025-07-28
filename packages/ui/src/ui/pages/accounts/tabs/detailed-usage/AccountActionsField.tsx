import React, {FC, useCallback} from 'react';
import AttributesButton from '../../../../components/AttributesButton/AttributesButton';

export type AccountRequestData = {title: string; path: string; cluster: string; account: string};

type Props = {
    cluster: string;
    path: string;
    account: string;
    onAttributeButtonClick: (accountData: AccountRequestData) => void;
};

export const AccountActionsField: FC<Props> = ({
    path,
    account,
    cluster,
    onAttributeButtonClick,
}) => {
    const handleOpenAttributeModal = useCallback(() => {
        onAttributeButtonClick({path, account, cluster, title: path});
    }, [onAttributeButtonClick, path, account, cluster]);

    if (!path) return undefined;

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
