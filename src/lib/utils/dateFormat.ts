export function formatDate(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 3600000) return "Just now";
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
  return new Date(timestamp).toLocaleDateString();
}
