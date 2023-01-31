import React from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

HighlightedText.propTypes = {
    className: PropTypes.string,
    text: PropTypes.string.isRequired,
    start: PropTypes.number,
    length: PropTypes.number,
    hasComa: PropTypes.bool,
};

interface Props {
    className: string;
    text: string;
    start?: number;
    length?: number;
    hasComa?: boolean;
    markBegin?: boolean;
}

export default function HighlightedText({className, text, start, length, hasComa}: Props) {
    const comma = hasComa ? <>,&nbsp;</> : null;

    if (length! > 0 && start! >= 0 && start! < text.length) {
        const begin = text.substr(0, start);
        const highlighted = text.substr(start!, length);
        const end = text.substr(start! + length!);

        return (
            <React.Fragment>
                {begin && <span className={className}>{begin}</span>}
                <span className={cn(className)({highlighted: true})}>{highlighted}</span>
                {end && <span className={className}>{end}</span>}
                {comma}
            </React.Fragment>
        );
    }

    return (
        <span className={className}>
            {text}
            {comma}
        </span>
    );
}

interface MultiProps extends Omit<Props, 'start'> {
    starts: Array<number>;
}

export function MultiHighlightedText({className, text, starts, length, hasComa}: MultiProps) {
    if (!length || !starts.length) {
        const comma = hasComa ? <>,&nbsp;</> : null;
        return (
            <span className={className}>
                {text}
                {comma}
            </span>
        );
    }

    const substrs = [];
    for (let i = 0, pos = 0; i < starts.length && pos < text.length; ++i) {
        const isLast = i === starts.length - 1;
        const to = starts[i] + (isLast ? text.length : length);
        const substr = text.substring(pos, to);
        if (substr) {
            substrs.push(
                <HighlightedText
                    className={className}
                    text={substr}
                    start={starts[i] - pos}
                    length={length}
                    hasComa={isLast && hasComa}
                />,
            );
        }
        pos = to;
    }
    return <>{substrs}</>;
}
