import type {TestRunnerConfig} from 'storybook/test-runner';
import {getStoryContext} from 'storybook/test-runner';

/*
 * See https://storybook.js.org/docs/writing-tests/test-runner#test-hook-api
 * to learn more about the test-runner hooks API.
 */
const config: TestRunnerConfig = {
    async postVisit(page, context) {
        // Get the entire context of a story, including parameters, args, argTypes, etc.
        const storyContext = await getStoryContext(page, context);

        // Trying to fix error "Axe is already running"
        await new Promise((resolve) => setTimeout(resolve, 1000));
    },
};

export default config;
