import React, {useMemo} from 'react';

const tokenRegex =
    /(\/{1,2}@[^/]+?[^/.,_-]+)|(\/{1,2}[^/.,_-]+)|([.,_-]{1,3}[^/.,_-]+)|([.,_-]{1,3})/g;

export interface WordWrapPathProps {
    path: string;
}

export const WordWrapPath: React.FC<WordWrapPathProps> = ({path}) => {
    return useMemo(() => {
        const tokens = path.match(tokenRegex)?.reduce<React.ReactNode[]>((list, part, index) => {
            if (index > 0) {
                list.push(<wbr />);
            }

            list.push(part);

            return list;
        }, []);

        return <>{tokens}</>;
    }, [path]);
};
