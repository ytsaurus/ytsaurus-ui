import React, {FC} from 'react';
import {Flex} from '@gravity-ui/uikit';
import Label, {LabelTheme} from '../../../components/Label/Label';

export type Props = {
    labels: {text: string; theme: LabelTheme}[];
};

export const SystemStateLabels: FC<Props> = ({labels}) => {
    if (!labels.length) return undefined;

    return (
        <Flex gap={1}>
            {labels.map(({text, theme}, index) => (
                <Label key={`${text}_${index}`} theme={theme} text={text} />
            ))}
        </Flex>
    );
};
