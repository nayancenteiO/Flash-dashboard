import { toast } from "@/components/ui/use-toast"

// Utility function for decryption
async function decryptField(encryptedData: string): Promise<string> {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      console.warn('Web Crypto API is not available. Returning encrypted data.');
      return encryptedData;
    }

    const { key, iv, encryptedData: encData } = JSON.parse(encryptedData);

    // Convert hex strings to Uint8Array
    const keyBuffer = new Uint8Array(key.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));
    const ivBuffer = new Uint8Array(iv.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));
    const encryptedBuffer = new Uint8Array(encData.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));

    // Import the key
    const importedKey = await window.crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );

    // Decrypt the data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-CBC", iv: ivBuffer },
      importedKey,
      encryptedBuffer
    );

    // Convert the decrypted buffer to a string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed:", error);
    toast({
      title: "Decryption Error",
      description: "Failed to decrypt data. Some information may be displayed in encrypted form.",
      variant: "destructive",
    });
    return encryptedData; // Return the original encrypted data if decryption fails
  }
}

export async function safeDecrypt(value: any): Promise<any> {
  if (typeof value === 'string' && value.startsWith('{')) {
    try {
      return await decryptField(value);
    } catch (error) {
      console.error('Error decrypting field:', error);
      return value; // Return the original value if decryption fails
    }
  }
  return value;
}

export { decryptField };