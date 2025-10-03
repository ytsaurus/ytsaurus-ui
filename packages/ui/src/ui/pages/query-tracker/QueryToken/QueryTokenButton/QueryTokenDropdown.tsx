import React, {FC, useMemo} from 'react';
import {Flex, Icon, Select, Text, Tooltip} from '@gravity-ui/uikit';
import './QueryTokenDropdown.scss';
import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {getQueryTokens} from '../../../../store/selectors/settings/settings-queries';
import CircleQuestionIcon from '@gravity-ui/icons/svgs/circle-question.svg';
import {updateQueryDraft} from '../../../../store/actions/queries/query';
import {QuerySecret} from '../../../../types/query-tracker/api';
import {getCurrentSecretIds} from '../../../../store/selectors/queries/query';
import i18n from './i18n';

const block = cn('yt-qt-token-dropdown');

export const QueryTokenDropdown: FC = () => {
    const dispatch = useDispatch();
    const tokens = useSelector(getQueryTokens);
    const secretIds = useSelector(getCurrentSecretIds);

    const options = useMemo(() => {
        return tokens.map((token) => ({
            value: token.name,
            content: token.name,
        }));
    }, [tokens]);

    const handleTokenChange = (values: string[]) => {
        const selectedTokens = tokens.filter((token) => values.includes(token.name));
        const secrets: QuerySecret[] = selectedTokens.map((token) => ({
            id: token.name,
            ypath: `${token.cluster}:${token.path}`,
        }));
        dispatch(updateQueryDraft({secrets}));
    };

    return (
        <Flex direction="column" className={block()} gap={3}>
            <Flex alignItems="center" gap={1}>
                <Text variant="subheader-3">{i18n('title_tokens')}</Text>
                <Tooltip content={i18n('context_add-token-info')}>
                    <Icon className={block('icon')} data={CircleQuestionIcon} size={16} />
                </Tooltip>
            </Flex>
            <Select
                options={options}
                value={secretIds}
                multiple
                hasClear
                onUpdate={handleTokenChange}
            />
        </Flex>
    );
};
