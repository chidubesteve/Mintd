/**
 * @file utils/maskEmail.ts
 * @description
 * Masks an email address for privacy.
 * Example: "alexander@yahoo.com" -> "al***er@yahoo.com"
 * Example: "js@mintd.uk" -> "j***s@mintd.uk"
 */


function maskEmail(email: string | undefined | null): string { 
    if(!email || !email.includes('@')) return 'your email address';


try {
    const [localPart, domain] = email.split('@');

    // edge case of very short local part, e.g. "j@mintd.uk"
    if (localPart.length < 4) {
        const firstChar = localPart.charAt(0);
        const lastChar = localPart.charAt(localPart.length - 1);
        return localPart.length > 1 ? `${firstChar}***${lastChar}@${domain}` : `${firstChar}***@${domain}`;
    }
    
    // standard masking, first 2 + *** + last 2
    const firstTwo = localPart.slice(0, 2);
    const lastTwo = localPart.slice(-2);

    return `${firstTwo}***${lastTwo}@${domain}`;
} catch (error) {
    return 'your email address';
}
}

export default maskEmail;