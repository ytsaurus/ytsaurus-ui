import React, {FC, PropsWithChildren} from 'react';
import {ArrowToggle, ClipboardButton, Flex, Text} from '@gravity-ui/uikit';
import {useToggle} from 'react-use';
import cn from 'bem-cn-lite';
import './McpMessage.scss';

const block = cn('mcp-message');

type Props = {
    title: string;
    clipboardValue: string;
    className?: string;
};

export const McpMessage: FC<PropsWithChildren<Props>> = ({
    title,
    children,
    clipboardValue,
    className,
}) => {
    const [isOpen, toggleOpen] = useToggle(false);

    const handleClipboardClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <Flex className={block(null, className)} direction="column" gap={2}>
            <Flex alignItems="center" gap={2} onClick={toggleOpen} className={block('header')}>
                <Text color="secondary">{title}</Text>
                <ArrowToggle direction={isOpen ? 'top' : 'bottom'} />
                <div onClick={handleClipboardClick}>
                    <ClipboardButton size="s" text={clipboardValue} />
                </div>
            </Flex>
            {isOpen && children}
        </Flex>
    );
};
