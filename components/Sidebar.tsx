import Link from './Link';
import menu from '../utils/Tabs';
import Permissions from '../utils/Permissions';

const Sidebar = () => {
  const displayMenu = [];
  const routes = Permissions.getRoutes();
  menu.forEach(tab => {
    routes.forEach(route => {
      if (route === tab.link) {
        displayMenu.push(tab);
      }
    });
  });

  return (
    <div className="sidebar white">
      <div className="grid vertical gutter-between h-full">
        <div>
          {displayMenu.map(({ label, icon, link }, index) => (
            <Link key={index} href={link}>
              <div className="center pv-md">
                <i className={icon}></i>
                <div className="xs mt-xs">{label}</div>
              </div>
            </Link>
          ))}
        </div>
        {
          <div
            className="yellow center"
            style={{
              position: 'absolute',
              bottom: '0',
              marginLeft: '2px',
              fontSize: '12px',
            }}
          >
            <div>v{process.env.NEXT_PUBLIC_APP_VERSION}</div>
            <div>[ {process.env.NEXT_PUBLIC_APP_HASH} ]</div>
          </div>
        }
      </div>
    </div>
  );
};

export default Sidebar;
