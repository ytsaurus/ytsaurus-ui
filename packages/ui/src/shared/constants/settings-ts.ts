import {ValueOf} from '../../@types/types';

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
