export const navigateTo = (url) => {
  if (!url) return;
  const currentFull = window.location.pathname + window.location.search + window.location.hash;
  if (currentFull === url) return;
  if (url.startsWith("#")) {
    window.location.hash = url;
    return;
  }
  window.history.pushState({}, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
};
