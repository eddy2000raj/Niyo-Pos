import { useRouter } from 'next/router';
import Permissions from '../utils/Permissions';

const Passport = ({ children }) => {
  const router = useRouter();
  const pathname = router.asPath;
  const isRoleAuthorized = Permissions.roleHasPermission(pathname);
  return isRoleAuthorized ? children : 'Unauthorized!';
};

export default Passport;
