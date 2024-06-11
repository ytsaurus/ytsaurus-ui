import path from 'path';
import {
    createLayoutPlugin,
    createRenderFunction,
    createYandexMetrikaPlugin,
} from '@gravity-ui/app-layout';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {ConfigData} from '../shared/yt-types';

const manifestPath = path.resolve(__dirname, '../../dist/public/build/assets-manifest.json');

const renderLayout = createRenderFunction([
    createLayoutPlugin({manifest: manifestPath}),
    createYandexMetrikaPlugin(),
]);

export type AppLayoutConfig = Parameters<typeof renderLayout<ConfigData>>[0];

export default renderLayout;
