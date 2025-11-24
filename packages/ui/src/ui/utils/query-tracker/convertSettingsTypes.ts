export function convertSettingsTypes(
    settings?: Record<string, unknown>,
): Record<string, string | number | boolean> {
    if (!settings) {
        return {};
    }

    const converted: Record<string, string | number | boolean> = {};

    for (const [key, value] of Object.entries(settings)) {
        if (typeof value === 'number' || typeof value === 'boolean') {
            converted[key] = value;
            continue;
        }

        if (typeof value !== 'string') {
            continue;
        }

        const trimmedValue = value.trim();

        const lowerValue = trimmedValue.toLowerCase();
        if (lowerValue === 'true') {
            converted[key] = true;
            continue;
        }
        if (lowerValue === 'false') {
            converted[key] = false;
            continue;
        }

        if (trimmedValue !== '' && !isNaN(Number(trimmedValue))) {
            const numValue = Number(trimmedValue);
            if (isFinite(numValue)) {
                converted[key] = numValue;
                continue;
            }
        }

        converted[key] = value;
    }

    return converted;
}
