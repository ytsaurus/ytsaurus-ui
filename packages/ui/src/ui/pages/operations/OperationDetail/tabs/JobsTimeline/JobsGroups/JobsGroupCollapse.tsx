import React, {FC, PropsWithChildren} from 'react';
import {useToggle} from 'react-use';
import {Flex, Icon} from '@gravity-ui/uikit';
import ChevronDownIcon from '@gravity-ui/icons/svgs/chevron-down.svg';
import './JobsGroupCollapse.scss';
import cn from 'bem-cn-lite';

const block = cn('yt-timeline-events-group-collapse');

type Props = {
    title: string;
    open?: boolean;
};

export const JobsGroupCollapse: FC<PropsWithChildren<Props>> = ({children, title, open = true}) => {
    const [isOpen, toggleOpen] = useToggle(open);

    return (
        <div className={block()}>
            <Flex alignItems="center" gap={2} onClick={toggleOpen} className={block('head')}>
                <Icon data={ChevronDownIcon} className={block('icon', {open: isOpen})} />
                {title}
            </Flex>
            {isOpen && <div className={block('content')}>{children}</div>}
        </div>
    );
};
