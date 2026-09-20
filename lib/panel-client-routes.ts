function usesAccessRoutes() {
  return (
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/admin/')
  );
}

export function panelApiPath(resource: string) {
  const cleanResource = resource.replace(/^\/+/, '');
  return `${usesAccessRoutes() ? '/api/admin/panel' : '/api/panel'}/${cleanResource}`;
}

export function panelApplicationsApiPath(suffix = '') {
  const cleanSuffix = suffix ? `/${suffix.replace(/^\/+/, '')}` : '';
  return `${usesAccessRoutes() ? '/api/admin/applications' : '/api/panel/applications'}${cleanSuffix}`;
}
