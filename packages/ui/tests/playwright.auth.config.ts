process.env.E2E_DIR = '1';

import config from './playwright.config';

const authConfig: typeof config = {
    ...config,
    testDir: './auth',
    testMatch: /\.auth\./,
    use: {
        ...config.use,
        storageState: undefined,
    },
};

export default authConfig;
