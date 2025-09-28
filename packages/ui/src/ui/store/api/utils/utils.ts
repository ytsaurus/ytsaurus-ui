import {AnyEndpointDefinition, AnyQueryDefinition} from '../types';

export function isQueryDefinition(
    endpointDefinition: AnyEndpointDefinition,
): endpointDefinition is AnyQueryDefinition {
    return endpointDefinition.type === 'query';
}
