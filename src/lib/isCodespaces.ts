export function isGitHubPreviewHost(u: string = location.host) {
  return /\.app\.github\.dev$/i.test(u);
}
export function isGitHubMainSite(u: string = location.host) {
  return /(^|\.)github\.com$/i.test(u);
}
