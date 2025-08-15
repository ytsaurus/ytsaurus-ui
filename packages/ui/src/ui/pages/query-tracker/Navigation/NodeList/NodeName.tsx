import React, {FC} from 'react';
import {Text} from '@gravity-ui/uikit';

type Props = {
    name: string;
    type?: string;
    targetPath?: string;
};

export const NodeName: FC<Props> = ({type, name, targetPath}) => {
    return (
        <Text ellipsis>
            {type === 'link' ? (
                <>
                    {name}{' '}
                    <span role="img" aria-label="Arrow pointing right" style={{margin: '0 4px'}}>
                        &#10142;
                    </span>{' '}
                    {targetPath}
                </>
            ) : (
                name
            )}
        </Text>
    );
};
