import {ButtonButtonProps} from '@gravity-ui/uikit';
import Button, {ButtonProps} from '../../../../../components/Button/Button';
import React, {FC, MouseEvent} from 'react';

type Props = Omit<Exclude<ButtonProps, ButtonButtonProps>, 'onClick'> & {
    className?: string;
    filename: string;
    title: string;
    qa?: string;
    onClick: (url: string, filename: string) => void;
};

export const ConfirmButton: FC<Props> = ({
    className,
    title,
    qa,
    filename,
    onClick,
    href,
    ...props
}) => {
    const handleClick = (e: MouseEvent) => {
        e.preventDefault();
        onClick(href, filename);
    };

    return (
        <Button
            size="m"
            className={className}
            title={title}
            target="_blank"
            onClick={handleClick}
            qa={qa}
            href={href}
            {...props}
        >
            {title}
        </Button>
    );
};
