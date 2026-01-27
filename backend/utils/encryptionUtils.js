const crypto = require('crypto');

/**
 * Encryption Utilities for Secure Payment Data Storage
 * Uses AES-256-GCM for authenticated encryption
 */

// Algorithm configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const ITERATIONS = 100000; // PBKDF2 iterations

/**
 * Derive a cryptographic key from the master key using PBKDF2
 * @param {string} masterKey - The master encryption key from environment
 * @param {Buffer} salt - Salt for key derivation
 * @returns {Buffer} Derived key
 */
const deriveKey = (masterKey, salt) => {
    return crypto.pbkdf2Sync(masterKey, salt, ITERATIONS, KEY_LENGTH, 'sha256');
};

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param {string|object} data - Data to encrypt (will be stringified if object)
 * @param {string} masterKey - Master encryption key
 * @returns {string} Base64-encoded encrypted data with IV, salt, and auth tag
 */
const encrypt = (data, masterKey = process.env.PAYMENT_ENCRYPTION_KEY) => {
    if (!masterKey) {
        throw new Error('PAYMENT_ENCRYPTION_KEY is not configured');
    }

    try {
        // Convert data to string if it's an object
        const plaintext = typeof data === 'object' ? JSON.stringify(data) : String(data);

        // Generate random salt and IV
        const salt = crypto.randomBytes(SALT_LENGTH);
        const iv = crypto.randomBytes(IV_LENGTH);

        // Derive encryption key
        const key = deriveKey(masterKey, salt);

        // Create cipher
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        // Encrypt data
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Get authentication tag
        const authTag = cipher.getAuthTag();

        // Combine salt + iv + authTag + encrypted data
        const combined = Buffer.concat([
            salt,
            iv,
            authTag,
            Buffer.from(encrypted, 'hex')
        ]);

        // Return as base64 string
        return combined.toString('base64');
    } catch (error) {
        console.error('Encryption error:', error.message);
        throw new Error('Failed to encrypt data');
    }
};

/**
 * Decrypt data encrypted with the encrypt function
 * @param {string} encryptedData - Base64-encoded encrypted data
 * @param {string} masterKey - Master encryption key
 * @returns {string|object} Decrypted data (parsed as JSON if possible)
 */
const decrypt = (encryptedData, masterKey = process.env.PAYMENT_ENCRYPTION_KEY) => {
    if (!masterKey) {
        throw new Error('PAYMENT_ENCRYPTION_KEY is not configured');
    }

    try {
        // Decode base64
        const combined = Buffer.from(encryptedData, 'base64');

        // Extract components
        const salt = combined.slice(0, SALT_LENGTH);
        const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
        const authTag = combined.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
        const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

        // Derive decryption key
        const key = deriveKey(masterKey, salt);

        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        // Decrypt data
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        // Try to parse as JSON, return string if it fails
        try {
            return JSON.parse(decrypted);
        } catch {
            return decrypted;
        }
    } catch (error) {
        console.error('Decryption error:', error.message);
        throw new Error('Failed to decrypt data');
    }
};

/**
 * Generate a secure random encryption key
 * @returns {string} Hex-encoded random key
 */
const generateEncryptionKey = () => {
    return crypto.randomBytes(KEY_LENGTH).toString('hex');
};

/**
 * Hash sensitive data for comparison (one-way)
 * @param {string} data - Data to hash
 * @returns {string} SHA-256 hash
 */
const hash = (data) => {
    return crypto.createHash('sha256').update(String(data)).digest('hex');
};

/**
 * Compare data with a hash
 * @param {string} data - Plain data
 * @param {string} hashedData - Hashed data to compare against
 * @returns {boolean} True if match
 */
const compareHash = (data, hashedData) => {
    const dataHash = hash(data);
    return crypto.timingSafeEqual(Buffer.from(dataHash), Buffer.from(hashedData));
};

/**
 * Generate HMAC signature for data integrity
 * @param {string|object} data - Data to sign
 * @param {string} secret - Secret key for HMAC
 * @returns {string} Base64-encoded HMAC signature
 */
const generateHMAC = (data, secret) => {
    const message = typeof data === 'object' ? JSON.stringify(data) : String(data);
    return crypto.createHmac('sha256', secret).update(message).digest('base64');
};

/**
 * Verify HMAC signature
 * @param {string|object} data - Original data
 * @param {string} signature - Signature to verify
 * @param {string} secret - Secret key for HMAC
 * @returns {boolean} True if signature is valid
 */
const verifyHMAC = (data, signature, secret) => {
    const expectedSignature = generateHMAC(data, secret);
    try {
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    } catch {
        return false;
    }
};

module.exports = {
    encrypt,
    decrypt,
    generateEncryptionKey,
    hash,
    compareHash,
    generateHMAC,
    verifyHMAC
};
