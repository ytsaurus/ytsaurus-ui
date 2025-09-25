import React from 'react';
import block from 'bem-cn-lite';
import {Button, Popup, PopupPlacement} from '@gravity-ui/uikit';
import {ItemSelector, ItemSelectorProps} from '@gravity-ui/components';

import unipika from '../../../common/thor/unipika';

import {SelectControl} from '../SelectControl/SelectControl';

import i18n from './i18n';

import './ColumnSelector.scss';

const b = block('yc-column-selector');

export interface ColumnSelectorProps<ItemType> {
    items: ItemType[];
    value: string[];
    onUpdate: (value: string[]) => void;

    renderItemValue?: ItemSelectorProps<ItemType>['renderItemValue'];
    renderItem?: ItemSelectorProps<ItemType>['renderItem'];
    filterItem?: ItemSelectorProps<ItemType>['filterItem'];
    getItemId?: ItemSelectorProps<ItemType>['getItemId'];
    className?: string;

    switcher?: React.ReactNode;
    controlWidth?: string;
    disabled?: boolean;
    popupPlacement?: PopupPlacement;
}

const defaultPlacement = 'bottom';

export function ColumnSelector<T>({
    className,
    switcher,
    disabled,
    controlWidth,
    items,
    value,
    onUpdate,
    renderItem,
    renderItemValue,
    getItemId,
    filterItem,
    popupPlacement = defaultPlacement,
}: ColumnSelectorProps<T>) {
    const refControl = React.useRef<HTMLDivElement>(null);
    const [focused, setFocused] = React.useState(false);
    const [renderPopup, setRenderPopup] = React.useState(false);
    const [currentValue, setCurrentValue] = React.useState<string[]>();

    React.useEffect(() => {
        setCurrentValue(undefined);
    }, [items, value]);

    React.useEffect(() => {
        if (disabled) {
            setFocused(false);
            setCurrentValue(undefined);
        }
    }, [disabled]);

    const handleControlClick = () => {
        if (!disabled) {
            setFocused((f) => !f);
            setCurrentValue(undefined);
            if (!renderPopup) {
                setRenderPopup(true);
            }
        }
    };

    const handleUpdate = React.useCallback((v: string[]) => {
        setCurrentValue(v);
    }, []);

    const handleClosePopup = React.useCallback(() => {
        setFocused(false);
    }, []);

    const handleCancelClick = React.useCallback(() => {
        setFocused(false);
        setCurrentValue(undefined);
    }, []);

    const handleApplyClick = React.useCallback(() => {
        setFocused(false);
        setCurrentValue(undefined);

        if (currentValue && value !== currentValue) {
            onUpdate(currentValue);
        }
    }, [currentValue, onUpdate, value]);

    return (
        <div className={b(null, className)}>
            <div className={b('control')} ref={refControl} onClick={handleControlClick}>
                {switcher || (
                    <SelectControl
                        displayArrow
                        disabled={disabled}
                        placeholder={i18n('label_placeholder')}
                        value={value?.map?.((item) => unipika.decode(item)) || []}
                        focused={focused}
                        width={controlWidth}
                    />
                )}
            </div>
            {renderPopup && (
                <Popup
                    anchorElement={refControl.current}
                    placement={popupPlacement}
                    open={focused}
                    onOpenChange={(open) => {
                        if (!open) {
                            handleClosePopup();
                        }
                    }}
                >
                    <ItemSelector
                        selectorTitle={i18n('label_columns')}
                        items={items}
                        value={currentValue ?? value}
                        onUpdate={handleUpdate}
                        getItemId={getItemId}
                        filterItem={filterItem}
                        renderItem={renderItem}
                        renderItemValue={renderItemValue}
                    />
                    <div className={b('controls')}>
                        <Button view="flat" className={b('control')} onClick={handleCancelClick}>
                            {i18n('button_cancel')}
                        </Button>
                        <Button view="action" className={b('control')} onClick={handleApplyClick}>
                            {i18n('button_apply')}
                        </Button>
                    </div>
                </Popup>
            )}
        </div>
    );
}
