import menu from './Tabs';
import Storage, { StorageKey } from '../utils/Storage';

const getAllTabRoutes = () => {
  const allRoutes: string[] = [];
  menu.forEach(obj => allRoutes.push(obj.link));
  return allRoutes;
};

const getRoutes = () => {
  const user = Storage.get(StorageKey.USER, null);
  let routes: string[] = [];
  const allRoutes = getAllTabRoutes();
  if (user && user.permissions && user.permissions.length > 0) {
    menu.forEach(tab => {
      user.permissions.forEach((permission: string) => {
        permission === 'sell' && !routes.includes('/') && routes.push('/');
        if (
          (tab.link.substring(1) === permission && tab.protected) ||
          (!tab.protected && !routes.includes(tab.link))
        ) {
          routes.push(tab.link);
        }
      });
    });
  } else {
    routes = allRoutes;
  }
  return routes;
};

const roleHasPermission = (route: string) => {
  const routes = getRoutes();
  const allRoutes = getAllTabRoutes();
  let isAuthorized: boolean = true;
  if (allRoutes.includes(route)) {
    isAuthorized = routes.includes(route);
  }
  return isAuthorized;
};

export default { roleHasPermission, getRoutes };
