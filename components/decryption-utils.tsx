import { useState, useEffect } from 'react';

type DecryptFunction = (encryptedData: string) => Promise<string>;

async function decryptField(encryptedData: string): Promise<string> {
  
  if (typeof window === 'undefined') {
    return encryptedData;
  }

  try {
    const { key, iv, encryptedData: encData } = JSON.parse(encryptedData);

    const keyBuffer = new Uint8Array(key.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));
    const ivBuffer = new Uint8Array(iv.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));
    const encryptedBuffer = new Uint8Array(encData.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));

    const crypto = window.crypto || (window as any).msCrypto;
    
    if (!crypto || !crypto.subtle) {
      console.warn('Web Crypto API is not available. Returning encrypted data.');
      return encryptedData;
    }

    const importedKey = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv: ivBuffer },
      importedKey,
      encryptedBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed:", error);
    return encryptedData;
  }
}

export function useDecryption(): DecryptFunction {
  const [decrypt, setDecrypt] = useState<DecryptFunction>(() => (data: string) => Promise.resolve(data));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDecrypt(() => decryptField);
    }
  }, []);

  return decrypt;
}