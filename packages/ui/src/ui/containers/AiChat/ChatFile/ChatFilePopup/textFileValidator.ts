import i18n from './i18n';

type ValidationResult = {
    isValid: boolean;
    error?: string;
};

const MAX_FILE_SIZE = 0.5 * 1024 * 1024; // 0.5MB

export const textFileValidator = async (file: File): Promise<ValidationResult> => {
    if (file.size > MAX_FILE_SIZE) {
        return {isValid: false, error: i18n('alert_file-too-large')};
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const content = new Uint8Array(arrayBuffer);

        // Check for binary files
        const bytesToCheck = Math.min(content.length, 8192);
        for (let i = 0; i < bytesToCheck; i++) {
            if (content[i] === 0) {
                return {isValid: false, error: i18n('alert_binary-data')};
            }
        }

        // Try to decode as UTF-8
        const decoder = new TextDecoder('utf-8', {fatal: true});
        decoder.decode(arrayBuffer);

        return {isValid: true};
    } catch (error) {
        return {isValid: false, error: i18n('alert_invalid-text-file')};
    }
};
