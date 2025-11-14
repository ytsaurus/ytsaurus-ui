import i18n from './i18n';

type ValidationResult = {
    isValid: boolean;
    error?: string;
};

const MAX_FILE_SIZE = 0.5 * 1024 * 1024; // 0.5MB
const ALLOWED_EXTENSIONS = ['.txt', '.csv', '.json', '.xml', '.md', '.js', '.ts', '.html', '.css'];
const ALLOWED_MIME_TYPES = [
    'text/plain',
    'text/html',
    'text/css',
    'text/csv',
    'text/markdown',
    'text/xml',
    'text/javascript',
    'application/json',
    'application/javascript',
];

export const textFileValidator = async (file: File): Promise<ValidationResult> => {
    if (file.size > MAX_FILE_SIZE) {
        return {isValid: false, error: i18n('alert_file-too-large')};
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (fileExtension && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
        return {isValid: false, error: i18n('alert_invalid-extension')};
    }

    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
        return {isValid: false, error: i18n('alert_invalid-mime-type')};
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const decoder = new TextDecoder('utf-8', {fatal: true});
        decoder.decode(arrayBuffer);

        const content = new Uint8Array(arrayBuffer);
        for (let i = 0; i < Math.min(content.length, 1024); i++) {
            if (content[i] === 0 && i > 0) {
                return {isValid: false, error: i18n('alert_binary-data')};
            }
        }

        return {isValid: true};
    } catch (error) {
        return {isValid: false, error: i18n('alert_invalid-text-file')};
    }
};
