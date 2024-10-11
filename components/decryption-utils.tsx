import { useState, useEffect } from 'react';

type DecryptFunction = (encryptedData: string) => Promise<string>;

async function decryptField(encryptedData: string): Promise<string> {
  
  try {
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
    return ""; // Return an empty string or handle the error as needed
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