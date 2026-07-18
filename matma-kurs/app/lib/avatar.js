export function getFallbackAvatar(userId) {
    const avatarIndex = Math.abs(Number(userId) || 0) % 5 + 1;
    return `/assets/img/avatars/avatar-${avatarIndex}.svg`;
}

function isTrustedRemoteAvatar(url) {
    try {
        const parsed = new URL(url);
        return parsed.hostname === 'res.cloudinary.com';
    } catch {
        return false;
    }
}

export function normalizeAvatarUrl(avatarUrl, userId) {
    const raw = typeof avatarUrl === 'string' ? avatarUrl.trim() : '';

    if (raw) {
        const markdownMatch = raw.match(/\((https?:\/\/[^)\s]+)\)/i);
        if (markdownMatch?.[1]) {
            return isTrustedRemoteAvatar(markdownMatch[1]) ? markdownMatch[1] : getFallbackAvatar(userId);
        }

        const urlMatch = raw.match(/https?:\/\/[^\s)]+/i);
        if (urlMatch?.[0]) {
            const cleanedUrl = urlMatch[0].replace(/[\])]+$/g, '');
            return isTrustedRemoteAvatar(cleanedUrl) ? cleanedUrl : getFallbackAvatar(userId);
        }

        if (raw.startsWith('/')) {
            return raw;
        }

        try {
            const parsed = new URL(raw);
            if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && isTrustedRemoteAvatar(raw)) {
                return raw;
            }
        } catch {
            // Use fallback below.
        }
    }

    return getFallbackAvatar(userId);
}
