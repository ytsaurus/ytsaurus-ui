import React, {FC} from 'react';
import {List} from '@gravity-ui/uikit';

export const QueryTokenList: FC = () => {
    const tokens: Record<string, string>[] = [];

    return <List items={tokens} />;
};
