import {
    UnipikaList,
    UnipikaMap,
    UnipikaMapKey,
    UnipikaPrimitive,
    UnipikaSettings,
    UnipikaString,
    UnipikaValue,
} from './StructuredYsonTypes';

// @ts-ignore
import unipika from '@gravity-ui/unipika/lib/unipika';

export type BlockType = 'object' | 'array' | 'attributes' | 'attributes-value';

export interface UnipikaFlattenTreeItem {
    level: number;
    open?: BlockType;
    close?: BlockType;

    path?: string; // if present the block is collapsible/expandable

    /**
     * Should not be used to render $attributes and $value keys cause such keys require specific visualization
     */
    key?: UnipikaMapKey;

    value?: UnipikaString | UnipikaPrimitive;

    /**
     * For YSON should not be true for closing blockType === 'attributes' cause for YSON a delimiter is not required
     */
    hasDelimiter?: boolean;

    // attributes specific
    isAfterAttributes?: boolean; // to determine is it required to write '"$value": ' for JSON view

    /**
     * We don't need isAttributes cause we can check blockType === 'attributes'
     */
    //isAttributes?: boolean // to determine is it required to write '"$value": ' for JSON view

    collapsed?: boolean;
}

export type UnipikaFlattenTree = Array<UnipikaFlattenTreeItem>;

interface FlattenUnipikaOptions {
    isJson?: boolean;
    collapsedState?: CollapsedState;
    matchedState?: {};
    settings?: UnipikaSettings;
    filter?: string;
}

export interface FlattenUnipikaResult {
    data: UnipikaFlattenTree;
    searchIndex: {[index: number]: SearchInfo};
}

export function flattenUnipika(
    value: UnipikaValue,
    options?: FlattenUnipikaOptions,
): FlattenUnipikaResult {
    const collapsedState = options?.collapsedState || {};
    const ctx = {
        dst: [],
        levels: [],
        path: [],
        isJson: Boolean(options?.isJson),
        collapsedState,
        matchedPath: '',
        collapsedPath: '',
    };
    flattenUnipikaImpl(value, 0, ctx);
    const searchIndex = makeSearchIndex(ctx.dst, options?.filter, {
        settings: options?.settings,
    });
    return {data: ctx.dst, searchIndex};
}

interface LevelInfo {
    type: BlockType;
    length: number;
    currentIndex: number;
}

interface FlatContext {
    readonly isJson: boolean;
    readonly collapsedState: CollapsedState;

    dst: UnipikaFlattenTree;
    levels: Array<LevelInfo>;
    path: Array<string>;
    collapsedPath: string;
}

export type CollapsedState = {[path: string]: boolean};

function isObjectLike(type: BlockType) {
    return type === 'object' || type === 'attributes-value' || type === 'attributes';
}

function flattenUnipikaImpl(value: UnipikaValue, level: number, ctx: FlatContext): void {
    if (ctx.isJson) {
        return flattenUnipikaJsonImpl(value, level, ctx);
    } else {
        return flattenUnipikaYsonImpl(value, level, ctx);
    }
}

function flattenUnipikaJsonImpl(value: UnipikaValue, level = 0, ctx: FlatContext): void {
    const beforeAttrs = ctx.dst.length;
    const {type} = ctx.levels[ctx.levels.length - 1] || {};
    const itemPathIndex = isObjectLike(type) ? beforeAttrs - 1 : ctx.dst.length;

    const isCollapsed = isPathCollapsed(ctx);
    const isContainerType = isValueContainenrType(value);

    let containerSize = 0;

    let hasAttributes = false;

    if (isCollapsed) {
        handleCollapsedValue(value, level, ctx);
    } else {
        let jsonOpenLevel = NaN;
        let valueLevel = level;

        if (value.$attributes && value.$attributes.length > 0) {
            hasAttributes = true;
            valueLevel = jsonOpenLevel = level;

            openBlock('attributes-value', jsonOpenLevel, ctx, 0);
            handlePath(ctx, ctx.dst.length - 1);
            ++valueLevel; // JSON specific behavior
            handleJsonAttributes(value.$attributes, valueLevel, ctx);
        }
        const afterAttrs = ctx.dst.length;

        containerSize = handleValueBlock(
            afterAttrs,
            hasAttributes,
            isContainerType,
            value,
            valueLevel,
            ctx,
        );

        if (hasAttributes) {
            ctx.dst[afterAttrs].isAfterAttributes = true;

            closeBlock('attributes-value', jsonOpenLevel, ctx);
        }
    }

    if (isContainerType) {
        if (hasAttributes || containerSize) {
            handlePath(ctx, itemPathIndex); // handle 'array item'/'object field' path
        }
    }
}

function handleJsonAttributes(
    $attributes: UnipikaMap['$value'],
    valueLevel: number,
    ctx: FlatContext,
): void {
    pushPath('@', ctx);

    const isCollapsed = isPathCollapsed(ctx);
    if (isCollapsed) {
        handleCollapsedBlock('attributes', valueLevel, ctx);
    } else {
        const attrsLevelInfo = openBlock('attributes', valueLevel, ctx, $attributes.length);
        handlePath(ctx, ctx.dst.length - 1);
        handleUnipikaMapImpl($attributes, valueLevel + 1, ctx, attrsLevelInfo);
        closeBlock('attributes', valueLevel, ctx);
    }

    popPath(ctx);
}

function handleValueBlock(
    afterAttrs: number,
    hasAttributes: boolean,
    isContainerType: boolean,
    value: UnipikaValue,
    valueLevel: number,
    ctx: FlatContext,
) {
    if (hasAttributes && isContainerType) {
        pushPath('$', ctx);
    }

    let containerSize = 0;

    const isValueCollapsed = isContainerType && isPathCollapsed(ctx);
    if (isValueCollapsed) {
        handleCollapsedValue(value, valueLevel, ctx);
    } else {
        switch (value.$type) {
            case 'map':
                handleUnipikaMap(value, valueLevel, ctx);
                containerSize = value.$value.length;
                break;
            case 'list':
                handleUnipikaList(value, valueLevel, ctx);
                containerSize = value.$value.length;
                break;
            case 'string':
                handleElement(fromUnipikaString(value, valueLevel), ctx);
                break;
            default:
                handleElement(fromUnipikaPrimitive(value, valueLevel), ctx);
                break;
        }
    }

    if (isContainerType && hasAttributes) {
        if (containerSize > 0) {
            handlePath(ctx, afterAttrs); //handle $ path
        }
        popPath(ctx);
    }

    return containerSize;
}

function flattenUnipikaYsonImpl(value: UnipikaValue, level = 0, ctx: FlatContext): void {
    const beforeAttrs = ctx.dst.length;
    const {type: parentType} = ctx.levels[ctx.levels.length - 1] || {};
    const itemPathIndex = isObjectLike(parentType) ? beforeAttrs - 1 : ctx.dst.length;

    let hasAttributes = false;
    let valueLevel = level;

    const isContainerType = isValueContainenrType(value);
    let containerSize = 0;

    const isCollapsed = isPathCollapsed(ctx);
    if (isCollapsed) {
        handleCollapsedValue(value, level, ctx);
    } else {
        if (value.$attributes && value.$attributes.length) {
            hasAttributes = true;
            valueLevel = parentType === 'array' ? level : level + 1;
            handleJsonAttributes(value.$attributes, valueLevel, ctx);
        }
        const afterAttrs = ctx.dst.length;

        containerSize = handleValueBlock(
            afterAttrs,
            hasAttributes,
            isContainerType,
            value,
            valueLevel,
            ctx,
        );

        if (hasAttributes) {
            ctx.dst[afterAttrs].isAfterAttributes = true;
        }
    }

    if (
        (containerSize && !hasAttributes) ||
        (hasAttributes && (parentType === 'object' || parentType === 'attributes'))
    ) {
        handlePath(ctx, itemPathIndex); // handle 'array item'/'object field' path
    }
}

function handleCollapsedValue(value: UnipikaValue, level: number, ctx: FlatContext) {
    switch (value.$type) {
        case 'map': {
            handleCollapsedBlock('object', level, ctx);
            break;
        }
        case 'list': {
            handleCollapsedBlock('array', level, ctx);
            break;
        }
        default: {
            handleCollapsedBlock('attributes-value', level, ctx);
        }
    }
}

function handleCollapsedBlock(type: BlockType, level: number, ctx: FlatContext) {
    openBlock(type, level, ctx, 0);
    const item = ctx.dst[ctx.dst.length - 1];
    item.collapsed = true;
    handlePath(ctx, ctx.dst.length - 1);
    closeBlock(type, level, ctx);
}

function handlePath(ctx: FlatContext, index: number) {
    if (ctx.collapsedPath.length) {
        ctx.dst[index].path = ctx.collapsedPath;
    }
}

function pushPath(path: string, ctx: FlatContext) {
    ctx.path.push(path);
    ctx.collapsedPath = ctx.collapsedPath.length ? ctx.collapsedPath + '/' + path : path;
}
function popPath(ctx: FlatContext) {
    const last = ctx.path.pop();
    if (last !== undefined) {
        ctx.collapsedPath = ctx.collapsedPath.substr(0, ctx.collapsedPath.length - last.length - 1);
    }
}

function isValueContainenrType(value: UnipikaValue) {
    return value.$type === 'map' || value.$type === 'list';
}

function isPathCollapsed(ctx: FlatContext) {
    return Boolean(ctx.collapsedState[ctx.collapsedPath]);
}

function openBlock(type: BlockType, level: number, ctx: FlatContext, length: number): LevelInfo {
    const {dst} = ctx;
    const last = getLastAsKey(dst);
    // for attributes level should be upper than level of key or parent array
    if (last?.key && last.level === level) {
        last.open = type;
    } else {
        dst.push({level, open: type});
    }
    const levelInfo = {type, length, currentIndex: 0};
    ctx.levels.push(levelInfo);
    return levelInfo;
}

function closeBlock(type: BlockType, level: number, ctx: FlatContext) {
    const info = ctx.levels.pop();
    if (info!.type !== type) {
        throw new Error(
            'The unipika tree cannot be converted to array, there is some mess with levels ' +
                `\n${JSON.stringify({type, level, info, ctx}, null, 2)}`,
        );
    }

    const last = ctx.dst[ctx.dst.length - 1];
    const isCloseSameAsOpen = last.level === level && last.open === type;

    const item: UnipikaFlattenTreeItem = isCloseSameAsOpen
        ? last
        : {
              level,
              close: type,
          };

    const isAttributesBlock = type === 'attributes';
    if ((!isAttributesBlock && isDelimiterRequired(ctx)) || (ctx.isJson && isAttributesBlock)) {
        item.hasDelimiter = true;
    }

    if (isCloseSameAsOpen) {
        item.close = type;
    } else {
        ctx.dst.push(item);
    }
}

function isDelimiterRequired(ctx: FlatContext) {
    const {length, currentIndex} = ctx.levels[ctx.levels.length - 1] || {};
    return length !== undefined && currentIndex < length - 1;
}

function handleElement(value: UnipikaFlattenTreeItem, ctx: FlatContext) {
    const lastAsKey = getLastAsKey(ctx.dst);
    if (lastAsKey && !lastAsKey.open) {
        Object.assign(lastAsKey, value, {level: lastAsKey.level});
    } else {
        ctx.dst.push(value);
    }

    const last = ctx.dst[ctx.dst.length - 1];
    if (isDelimiterRequired(ctx)) {
        last.hasDelimiter = true;
    }
}

function getLastAsKey(dst: UnipikaFlattenTree) {
    const item = dst[dst.length - 1];
    return item?.key && !item?.close ? item : null;
}

function handleUnipikaMap(map: UnipikaMap, level: number, ctx: FlatContext) {
    const info = openBlock('object', level, ctx, map.$value.length);
    handleUnipikaMapImpl(map.$value, level + 1, ctx, info);
    closeBlock('object', level, ctx);
}

function handleUnipikaMapImpl(
    items: UnipikaMap['$value'],
    level: number,
    ctx: FlatContext,
    info: LevelInfo,
) {
    for (let i = 0; i < items.length; ++i) {
        const [key, value] = items[i];
        const keyItem: UnipikaFlattenTreeItem = {key, level: level};
        ctx.dst.push(keyItem);
        pushPath(key.$value, ctx);
        flattenUnipikaImpl(value, level, ctx);
        ++info.currentIndex;
        popPath(ctx);
    }
}

function handleUnipikaList(value: UnipikaList, level: number, ctx: FlatContext) {
    const {$value: items} = value;
    const info = openBlock('array', level, ctx, items.length);
    for (let i = 0; i < items.length; ++i) {
        pushPath(String(i), ctx);
        flattenUnipikaImpl(items[i], level + 1, ctx);
        ++info.currentIndex;
        popPath(ctx);
    }
    closeBlock('array', level, ctx);
}

function fromUnipikaString(value: UnipikaString, level: number): UnipikaFlattenTreeItem {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {$attributes, ...rest} = value;
    return {level: level, value: rest};
}

function fromUnipikaPrimitive(value: UnipikaPrimitive, level: number): UnipikaFlattenTreeItem {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {$attributes, ...rest} = value;
    return {level: level, value: rest};
}

interface SearchParams {
    settings?: UnipikaSettings;
}

export interface SearchInfo {
    keyMatch?: Array<number>;
    valueMatch?: Array<number>;
}

type SearchIndex = {[index: number]: SearchInfo};

export function makeSearchIndex(
    tree: UnipikaFlattenTree,
    filter?: string,
    options?: SearchParams,
): SearchIndex {
    if (!filter) {
        return {};
    }
    const settings = Object.assign<UnipikaSettings, UnipikaSettings | undefined, UnipikaSettings>(
        {},
        options?.settings,
        {asHTML: false},
    );
    const res: SearchIndex = {};
    for (let i = 0; i < tree.length; ++i) {
        const {key, value} = tree[i];
        const keyMatch = rowSearchInfo(key, filter, settings);
        const valueMatch = rowSearchInfo(value, filter, settings);
        if (keyMatch || valueMatch) {
            res[i] = Object.assign({}, keyMatch && {keyMatch}, valueMatch && {valueMatch});
        }
    }
    return res;
}

type SearchValue = undefined | UnipikaMapKey | UnipikaString | UnipikaPrimitive;

function rowSearchInfo(
    v: SearchValue,
    filter: string,
    settings: UnipikaSettings,
): Array<number> | undefined {
    if (!v) {
        return undefined;
    }
    const res = [];
    let tmp = unipika.formatValue(v, settings);
    if (!tmp) {
        return undefined;
    }
    tmp = String(tmp); //unipika.formatValue might return an instance of Number
    if (v.$type === 'string') {
        tmp = tmp.substring(1, tmp.length - 1); // skip quotes
    }
    let from = 0;
    while (from >= 0 && from < tmp.length) {
        const index = tmp.indexOf(filter, from);
        if (-1 === index) {
            break;
        }
        from = index + filter.length;
        res.push(index);
    }
    return res.length ? res : undefined;
}
