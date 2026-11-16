import {type ValuesType} from 'utility-types';

export const STARTING_PAGE_IDS = ['navigation', 'operations', 'dashboard', 'system'] as const;

export type StartingPage = ValuesType<typeof STARTING_PAGE_IDS>;
