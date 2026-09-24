import {type ValueOf} from '../../@types/types';
import {type ValuesType} from 'utility-types';

export const STARTING_PAGE_IDS = ['navigation', 'operations', 'dashboard', 'system'] as const;

export type StartingPage = ValuesType<typeof STARTING_PAGE_IDS>;

export type AnnotationVisibilityType = ValueOf<typeof AnnotationVisibility>;

export const AnnotationVisibility = {
    HIDDEN: 'hidden',
    VISIBLE: 'visible',
    PARTIAL: 'partial',
} as const;

export function normalizeAnnotationVisibility(
    value?: AnnotationVisibilityType,
): AnnotationVisibilityType {
    return value || AnnotationVisibility.PARTIAL;
}
