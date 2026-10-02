import {isLinkExternal} from '../../common/utils/url';
import {type MouseEvent} from 'react';

type ActionMouseEvent = MouseEvent<Element>;

const action = {
    openInAnotherTab(evt: Pick<ActionMouseEvent, 'ctrlKey' | 'metaKey' | 'button'>) {
        return evt.ctrlKey || evt.metaKey || evt.button === 1;
    },
    isCheckboxClicked(evt: Pick<ActionMouseEvent, 'target'>) {
        const {target} = evt;
        return (
            ('type' in target && target.type === 'checkbox') ||
            ('className' in target && target.className === 'checkbox__label')
        );
    },
    textSelected() {
        return typeof document.getSelection === 'function'
            ? !document.getSelection()!.isCollapsed
            : false;
    },
    isTableCellSelected() {
        if (typeof document.getSelection === 'function') {
            const selection = document.getSelection()!;
            return (
                selection.anchorNode &&
                'tagName' in selection.anchorNode &&
                selection.anchorNode.tagName === 'TR'
            );
        }
        return false;
    },
    onClick(evt: ActionMouseEvent, skipSelectionCheck?: boolean) {
        evt.stopPropagation();

        if (!action.textSelected() || skipSelectionCheck) {
            const targetIsLink = evt.currentTarget.nodeName === 'A';
            const url = evt.currentTarget.getAttribute('href');

            if (action.openInAnotherTab(evt)) {
                if (!targetIsLink) {
                    window.open(url!);
                }
                return;
            }

            evt.preventDefault();
        }
    },
    makeEntryClickHandler<
        Args extends Array<string | number | boolean | object | null | undefined>,
    >(
        evt: ActionMouseEvent,
        clickHandler?: (...args: Args) => void,
        linkHandler?: (...args: Args) => string | undefined | null,
    ) {
        return (...args: Args) => {
            // Firefox default action on Ctrl + Click a table cell is to select the cell - remove the selection
            if (action.isTableCellSelected()) {
                document.getSelection()!.removeAllRanges();
            }
            // Do not call handler on right button click or if text is selected
            if (action.textSelected() || action.isCheckboxClicked(evt) || evt.button === 2) {
                return;
            }

            if (clickHandler) {
                clickHandler(...args);
            } else if (linkHandler) {
                const url = linkHandler(...args);
                if (!url) {
                    return;
                }
                evt.stopPropagation();
                if (action.openInAnotherTab(evt)) {
                    window.open(url);
                } else if (!isLinkExternal(url)) {
                    evt.preventDefault();
                } else {
                    window.location.href = url;
                }
            }
        };
    },
};

export default action;
