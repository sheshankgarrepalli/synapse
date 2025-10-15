import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// Get tenant-specific encryption key (derived from master key + tenant ID)
function getTenantKey(tenantId: string): Buffer {
  const masterKey = process.env.ENCRYPTION_MASTER_KEY!;
  if (!masterKey) {
    throw new Error('ENCRYPTION_MASTER_KEY environment variable is not set');
  }
  return scryptSync(masterKey, tenantId, 32); // 32 bytes for AES-256
}

export async function encrypt(plaintext: string, tenantId: string): Promise<string> {
  const key = getTenantKey(tenantId);
  const iv = randomBytes(16); // Initialization vector
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export async function decrypt(ciphertext: string, tenantId: string): Promise<string> {
  const key = getTenantKey(tenantId);
  const parts = ciphertext.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid ciphertext format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
