import {useRef} from 'react';

import {useDispatch, useSelector} from 'react-redux';
import {DashKit, DashKitProps} from '@gravity-ui/dashkit';

import {setSettingByKey} from '../../../store/actions/settings';
import {toggleEditing} from '../../../store/reducers/dashboard2/dashboard';
import {getDashboardConfig} from '../../../store/selectors/dashboard2/dashboard';
import {getCluster} from '../../../store/selectors/global';

import {dashboardConfig, defaultDashboardItems} from '../../../constants/dashboard2';

type ConfigsTypes = keyof typeof defaultDashboardItems;

function calculateItemPosition(
    layout: DashKitProps['config']['layout'],
    height: number,
    width: number,
    maxLayoutWidth = 36,
) {
    const maxY = Math.max(...layout.map((i) => i.y + i.h), 0);
    const maxX = Math.max(...layout.map((i) => i.x + i.w), 0);

    const dotesGrid = Array.from({length: Math.max(maxY + height, 100)}, () =>
        Array.from({length: Math.min(maxLayoutWidth, Math.max(maxX + width, 100))}, () => 0),
    );

    for (const item of layout) {
        for (let py = item.y; py < item.y + item.h; py++) {
            for (let px = item.x; px < item.x + item.w; px++) {
                if (py < dotesGrid.length && px < dotesGrid[0].length) {
                    dotesGrid[py][px] = 1;
                }
            }
        }
    }

    // Find all valid positions where the new block can be placed
    const validPositions = [];

    // Check each possible position
    for (let y = 0; y < dotesGrid.length - height + 1; y++) {
        // Ensure we don't place blocks that would exceed the maximum layout width
        for (let x = 0; x < dotesGrid[0].length - width + 1 && x + width <= maxLayoutWidth; x++) {
            // Check if this position is valid (all cells are free)
            let isValid = true;

            // Check if the entire block area is free
            for (let dy = 0; dy < height; dy++) {
                for (let dx = 0; dx < width; dx++) {
                    if (dotesGrid[y + dy][x + dx] === 1) {
                        isValid = false;
                        break;
                    }
                }
                if (!isValid) break;
            }
            if (isValid) {
                // Calculate distance to nearest top and left blocks
                // We want to minimize this distance
                let minDistance = Infinity;

                // Check distance to each existing block
                for (const item of layout) {
                    // Calculate Manhattan distance from current position to this block
                    // We want to be close to blocks that are above or to the left
                    const dx = Math.max(0, x - (item.x + item.w)); // Distance to left edge
                    const dy = Math.max(0, y - (item.y + item.h)); // Distance to top edge

                    // Prioritize positions that are directly to the right or below existing blocks
                    // by giving them a smaller distance value
                    const distance = dx + dy;

                    if (distance < minDistance) {
                        minDistance = distance;
                    }
                }
                validPositions.push({
                    x: x,
                    y: y,
                    distance: minDistance,
                });
            }
        }
    }

    // If no valid positions found, place the block at the beginning of a new row
    if (validPositions.length === 0) {
        // Place the block at the beginning of a new row (x=0) below all existing blocks
        return {
            x: 0,
            y: maxY, // maxY is already the position below all existing blocks
            w: width,
            h: height,
        };
    }

    // Sort valid positions by distance (ascending)
    validPositions.sort((a, b) => {
        // First prioritize by distance
        if (a.distance !== b.distance) {
            return a.distance - b.distance;
        }
        // If distances are equal, prioritize by y (top-most)
        if (a.y !== b.y) {
            return a.y - b.y;
        }
        // If y is equal, prioritize by x (left-most)
        return a.x - b.x;
    });

    // Return the best position
    return {
        x: validPositions[0].x,
        y: validPositions[0].y,
        w: width,
        h: height,
    };
}

export function useUpdateDashboard() {
    const dispatch = useDispatch();

    const cluster = useSelector(getCluster);
    const config = useSelector(getDashboardConfig);

    const settingPath = `local::${cluster}::dashboard::config` as const;
    const prevConfig = useRef(config);

    const generateConfig = (configType: ConfigsTypes) =>
        DashKit.setItem({
            item: {
                namespace: 'dashboard',
                type: configType,
                data: defaultDashboardItems[configType].data,
                layout: calculateItemPosition(
                    config.layout,
                    defaultDashboardItems[configType].layout.h,
                    defaultDashboardItems[configType].layout.w,
                ),
            },
            config,
        });

    const save = () => {
        dispatch(setSettingByKey(settingPath, config));
        dispatch(toggleEditing());
    };
    const update = (newConfig: DashKitProps['config']) => {
        dispatch(setSettingByKey(settingPath, {...newConfig}));
    };
    const add = (configType: ConfigsTypes) => {
        const newConfig = generateConfig(configType);
        dispatch(setSettingByKey(settingPath, {...newConfig}));
    };
    const cancel = () => {
        dispatch(setSettingByKey(settingPath, prevConfig.current));
        dispatch(toggleEditing());
    };
    const edit = () => {
        dispatch(toggleEditing());
    };
    const reset = () => {
        dispatch(setSettingByKey(settingPath, dashboardConfig));
    };

    return {
        edit,
        add,
        save,
        cancel,
        update,
        reset,
    };
}
