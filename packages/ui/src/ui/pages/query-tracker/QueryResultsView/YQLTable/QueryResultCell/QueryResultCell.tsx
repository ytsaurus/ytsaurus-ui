import * as React from 'react';
import {Eye} from '@gravity-ui/icons';
import {Button, ClipboardButton, Text, Icon as UIKitIcon} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {ClickableText} from '../../../../../components/ClickableText/ClickableText';
import Label from '../../../../../components/Label';
import {unquote} from '../../../../../utils/string';
import {formatResults} from '../../../../../utils/queries/format';
import type {Result} from '../../../../../types/query-tracker/queryResult';
import type {UnipikaSettings} from '../../../../../components/Yson/StructuredYson/StructuredYsonTypes';
import './QueryResultCell.scss';

const block = cn('yt-query-result-cell');
const NUMBER_OF_STRIPPED_LINES = 5;
const MAX_NUMBER_OF_LINE_IS_DISPLAYED_IMMEDIATELY = NUMBER_OF_STRIPPED_LINES + 3;

type CellValue = Pick<Result, '$type' | '$value'> &
    Partial<Result> & {$additions?: React.ReactNode};
type Props = {
    value?: CellValue;
    format?: (value: CellValue, settings?: UnipikaSettings) => string;
    formatterSettings?: UnipikaSettings;
    showFullValueInDialog?: boolean;
    onShowPreview: (tag?: string) => void | Promise<void>;
};

function triggerWindowResize() {
    window.dispatchEvent(new Event('resize'));
}

export function QueryResultCell({
    value,
    format = formatResults,
    formatterSettings,
    showFullValueInDialog,
    onShowPreview,
}: Props) {
    let formattedValue;
    if (!value) {
        return <span className="unipika">&lt;unsupported data type&gt;</span>;
    }
    if (typeof value.$formattedValue === 'string') {
        formattedValue = value.$formattedValue;
    } else {
        formattedValue = format(value, formatterSettings);
    }
    const copyValue = value.$rawValue ?? value.$value;
    const rawValue = typeof copyValue === 'string' ? unquote(copyValue) : undefined;
    const fullFormattedValue = value.$fullFormattedValue ?? formattedValue;
    let strippedDown: string;
    if (value.$type === 'yql.string' && formattedValue.startsWith('<span class="quote">')) {
        strippedDown = formattedValue;
    } else {
        const lines = formattedValue.split('\n');
        if (lines.length > MAX_NUMBER_OF_LINE_IS_DISPLAYED_IMMEDIATELY) {
            strippedDown = lines.slice(0, NUMBER_OF_STRIPPED_LINES).join('\n');
        } else {
            strippedDown = formattedValue;
        }
    }
    const isStrippedDown = strippedDown !== fullFormattedValue;

    const additions = value.$additions ? (
        <React.Fragment>
            <br />
            <Text color="light-hint">{value.$additions}</Text>
        </React.Fragment>
    ) : null;

    const isTruncated = value.$incomplete;
    const tag = value.$tagValue;

    const handlePreviewClick = () => {
        return onShowPreview(tag);
    };

    if (isStrippedDown) {
        return (
            <TableCell
                rawValue={rawValue}
                onPreviewClick={handlePreviewClick}
                isTruncated={isTruncated}
                tag={tag}
            >
                {showFullValueInDialog ? (
                    <React.Fragment>
                        <span
                            className="unipika"
                            dangerouslySetInnerHTML={{
                                __html: strippedDown,
                            }}
                        />
                    </React.Fragment>
                ) : (
                    <ShowMoreInline
                        onClick={triggerWindowResize}
                        strippedDown={strippedDown}
                        formattedValue={fullFormattedValue}
                    />
                )}
                {additions}
            </TableCell>
        );
    }
    return (
        <TableCell
            rawValue={rawValue}
            onPreviewClick={handlePreviewClick}
            isTruncated={isTruncated}
            tag={tag}
        >
            <span className="unipika" dangerouslySetInnerHTML={{__html: formattedValue}} />
            {additions}
        </TableCell>
    );
}

interface ShowMoreInlineProps {
    formattedValue: string;
    strippedDown: string;
    onClick?(): void;
}
function ShowMoreInline({formattedValue, strippedDown, onClick}: ShowMoreInlineProps) {
    const [showFull, setShowFull] = React.useState(false);
    return (
        <React.Fragment>
            <span
                className="unipika"
                dangerouslySetInnerHTML={{
                    __html: showFull ? formattedValue : strippedDown,
                }}
            />
            <br />
            <ClickableText
                onClick={() => {
                    setShowFull((v) => !v);

                    onClick?.();
                }}
            >
                {showFull ? 'Show less' : 'Show more'}
            </ClickableText>
        </React.Fragment>
    );
}

const cellActionClassName = block('cell-action');

interface TableCellProps {
    children?: React.ReactNode;
    rawValue?: string;
    onPreviewClick: () => void | Promise<void>;
    isTruncated?: boolean;
    tag?: string;
}

function TableCell({children, rawValue, onPreviewClick, isTruncated, tag}: TableCellProps) {
    const cellNodeRef = React.useRef<HTMLSpanElement>(null);
    const [mount, setMount] = React.useState(false);

    React.useEffect(() => {
        const parent = cellNodeRef.current?.parentElement;

        function handleMouseOver() {
            setMount(true);
        }
        function handleMouseOut(e: MouseEvent) {
            if (!(e.relatedTarget instanceof Node) || !parent?.contains(e.relatedTarget)) {
                setMount(false);
            }
        }
        parent?.addEventListener('mouseover', handleMouseOver);
        parent?.addEventListener('mouseout', handleMouseOut);

        return () => {
            parent?.removeEventListener('mouseover', handleMouseOver);
            parent?.removeEventListener('mouseout', handleMouseOut);
        };
    }, []);

    const isTruncatedTaggedType = Boolean(tag && isTruncated);

    const [isPreviewInProgress, setPreviewInProgress] = React.useState(false);

    return (
        <span ref={cellNodeRef} className={block()}>
            {isTruncatedTaggedType ? (
                <Label theme="warning" text={`Incomplete '${tag}' type`} />
            ) : (
                <span className={block('cell-content')}>{children}</span>
            )}
            {(mount || isTruncatedTaggedType) && (
                <>
                    {rawValue && !isTruncated && (
                        <ClipboardButton className={cellActionClassName} text={rawValue} size="s" />
                    )}
                    {isTruncated && (
                        <Button
                            className={cellActionClassName}
                            view="flat-secondary"
                            size="s"
                            loading={isPreviewInProgress}
                            onClick={async () => {
                                try {
                                    setPreviewInProgress(true);
                                    if (!isPreviewInProgress) {
                                        await onPreviewClick();
                                    }
                                } finally {
                                    setPreviewInProgress(false);
                                }
                            }}
                            qa="query:reqult:show-preview"
                        >
                            <UIKitIcon data={Eye} size="12" />
                        </Button>
                    )}
                </>
            )}
        </span>
    );
}
