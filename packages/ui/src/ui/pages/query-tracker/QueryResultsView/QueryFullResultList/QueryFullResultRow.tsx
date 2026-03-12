import React, {FC} from 'react';
import block from 'bem-cn-lite';
import {Button, Flex, Icon, Link, Text} from '@gravity-ui/uikit';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import {makeNavigationLink} from '../../../../utils/app-url';
import './QueryFullResultRow.scss';
import TextIndentIcon from '@gravity-ui/icons/svgs/text-indent.svg';
import {makePathByQueryEngine} from '../../Navigation/helpers/makePathByQueryEngine';
import {insertTextWhereCursor} from '../../Navigation/helpers/insertTextWhereCursor';
import {useMonaco} from '../../hooks/useMonaco';
import {QueryEngine} from '../../../../../shared/constants/engines';

type Props = {
    id: number;
    engine: QueryEngine;
    cluster: string;
    path: string;
    isExist: boolean;
};

const b = block('yt-query-full-result-row');

export const QueryFullResultRow: FC<Props> = ({id, cluster, engine, path, isExist}) => {
    const {getEditor} = useMonaco();
    const navigationLink = makeNavigationLink({cluster, path: `//${path}`});

    const handlePastePath = () => {
        if (!cluster) return;
        const editor = getEditor('queryEditor');
        const pathString = makePathByQueryEngine({
            cluster,
            path: `//${path}`,
            engine,
        });
        insertTextWhereCursor(pathString, editor);
    };

    return (
        <div className={b()}>
            <Text variant="subheader-1">Full Result {id}</Text>
            {!isExist && <span>Table has been removed from cluster</span>}
            {isExist ? (
                <Link target="_blank" href={navigationLink}>
                    {cluster}.`{path}`
                </Link>
            ) : (
                <Text>
                    {cluster}.`{path}`
                </Text>
            )}
            <Flex alignItems="center" gap={1}>
                <Button
                    view="flat"
                    disabled={!isExist}
                    onClick={() => {
                        window.open(navigationLink, '_blank');
                    }}
                >
                    <Icon data={ArrowUpRightFromSquareIcon} size={16} />
                </Button>
                <Button view="flat" onClick={handlePastePath}>
                    <Icon data={TextIndentIcon} size={16} />
                </Button>
            </Flex>
        </div>
    );
};
