// Lekkie walidatory inputu. Rzucają ValidationError z komunikatem — caller łapie i zwraca 400.

export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

export function validateString(value, { field, min = 0, max = 1000, required = true, trim = true } = {}) {
    if (value == null || value === '') {
        if (required) throw new ValidationError(`${field} jest wymagane`);
        return null;
    }
    if (typeof value !== 'string') {
        throw new ValidationError(`${field} musi być tekstem`);
    }
    const cleaned = trim ? value.trim() : value;
    if (cleaned.length < min) {
        throw new ValidationError(`${field} musi mieć co najmniej ${min} znaków`);
    }
    if (cleaned.length > max) {
        throw new ValidationError(`${field} może mieć maksymalnie ${max} znaków`);
    }
    return cleaned;
}

export function validateInt(value, { field, min, max, required = true } = {}) {
    if (value == null || value === '') {
        if (required) throw new ValidationError(`${field} jest wymagane`);
        return null;
    }
    const parsed = typeof value === 'number' ? value : parseInt(value, 10);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
        throw new ValidationError(`${field} musi być liczbą całkowitą`);
    }
    if (min != null && parsed < min) {
        throw new ValidationError(`${field} musi być co najmniej ${min}`);
    }
    if (max != null && parsed > max) {
        throw new ValidationError(`${field} może być maksymalnie ${max}`);
    }
    return parsed;
}

export function validateUrl(value, { field, max = 500, required = false } = {}) {
    const str = validateString(value, { field, max, required });
    if (str == null) return null;
    try {
        const url = new URL(str);
        if (url.protocol !== 'https:' && url.protocol !== 'http:') {
            throw new ValidationError(`${field} musi być prawidłowym URL-em (http/https)`);
        }
        return str;
    } catch {
        throw new ValidationError(`${field} musi być prawidłowym URL-em`);
    }
}
