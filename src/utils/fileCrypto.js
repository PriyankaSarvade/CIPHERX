export const computeSHA256 = async (file) => {
  if (!file) return '';
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (err) {
    console.error('Error computing SHA-256:', err);
    return '';
  }
};

export const computeFileSHA256 = computeSHA256;
