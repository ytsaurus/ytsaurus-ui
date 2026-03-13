import block from 'bem-cn-lite';

import './Label.scss';

const b = block('elements-label');

export type LabelTheme =
    | 'default'
    | 'success'
    | 'warning'
    | 'danger'
    | 'error'
    | 'info'
    | 'complementary'
    | 'misc';

interface Props {
    className?: string;
    theme?: LabelTheme;
    type?: 'block' | 'text';
    text?: string | number;
    capitalize?: boolean;
    children?: React.ReactNode;
    hideTitle?: boolean;
}

export const Label = ({
    theme = 'default',
    type = 'block',
    text,
    hideTitle,
    className,
    children,
    capitalize,
}: Props) => {
    return (
        <span
            className={b({theme, type, capitalize}, className)}
            title={hideTitle ? undefined : (text as string)}
        >
            {text || children}
        </span>
    );
};
