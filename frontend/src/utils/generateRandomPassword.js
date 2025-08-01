export function generateRandomPassword(length = 16) {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnpqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#%^&*';
    const charset = uppercase + lowercase + numbers + symbols;

    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);

    let password = '';
    for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
    }

    return password;
}