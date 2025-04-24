import Button, {ButtonProps} from '../../../../../components/Button/Button';
import React, {FC, MouseEvent} from 'react';

type Props = {
    className?: string;
    filename: string;
    url: string;
    title: string;
    qa?: string;
    onClick: (url: string, filename: string) => void;
} & Omit<ButtonProps, 'onClick'>;

export const ConfirmButton: FC<Props> = ({
    url,
    className,
    title,
    qa,
    filename,
    onClick,
    ...props
}) => {
    const handleClick = (e: MouseEvent) => {
        e.preventDefault();
        onClick(url, filename);
    };

    return (
        <Button
            size="m"
            className={className}
            title={title}
            target="_blank"
            onClick={handleClick}
            href={url}
            qa={qa}
            {...props}
        >
            {title}
        </Button>
    );
};
