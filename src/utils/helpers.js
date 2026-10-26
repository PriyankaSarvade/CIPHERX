export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return '';
  const birthDate = new Date(dateOfBirth);
  if (isNaN(birthDate.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : '';
};

export const generateUniqueId = (prefix = 'EVD', existingCount = 0) => {
  const currentYear = new Date().getFullYear();
  const number = String(existingCount + 1).padStart(3, '0');
  return `${prefix}-${currentYear}-${number}`;
};

export const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
