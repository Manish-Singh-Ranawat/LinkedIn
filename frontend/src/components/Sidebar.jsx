import { Link } from "react-router-dom";
import { Home, UserPlus, Bell } from "lucide-react";

export default function Sidebar({ user }) {

  return (
    <div className="bg-secondary rounded-lg shadow">
      <div className="p-4 text-center">
        {/* Banner */}
        <div
          className="h-16 rounded-t-lg bg-cover bg-center"
          style={{
            backgroundImage: `url("${user.bannerImg || "/banner.png"}")`,
          }}
        />
        {/* Profile */}
        <Link to={`/profile/${user.username}`}>
          <img
            src={user.profilePicture || "/avatar.png"}
            alt={user.name}
            className="w-20 h-20 rounded-full mx-auto mt-[-40px]"
          />
          <h2 className="text-xl font-semibold mt-2">{user.name}</h2>
        </Link>
        {/* Headline */}
        <p className="text-info">{user.headline}</p>
        {/* Connections */}
        <p className="text-info text-xs">
          {user.connections.length} connections
        </p>
      </div>

      {/* Links */}
      <div className="border-t border-base-100 p-4">
        <nav>
          <ul className="space-y-2">
            {/* Home */}
            <li>
              <Link
                to="/"
                className="flex items-center py-2 px-4 rounded-md hover:bg-primary hover:text-white transition-colors"
              >
                <Home className="mr-2" size={20} /> Home
              </Link>
            </li>
            {/* My Network */}
            <li>
              <Link
                to="/network"
                className="flex items-center py-2 px-4 rounded-md hover:bg-primary hover:text-white transition-colors"
              >
                <UserPlus className="mr-2" size={20} /> My Network
              </Link>
            </li>
            {/* Notifications */}
            <li>
              <Link
                to="/notifications"
                className="flex items-center py-2 px-4 rounded-md hover:bg-primary hover:text-white transition-colors"
              >
                <Bell className="mr-2" size={20} /> Notifications
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      {/* Profile Link */}
      <div className="border-t border-base-100 p-4">
        <Link
          to={`/profile/${user.username}`}
          className="text-sm font-semibold"
        >
          Visit your profile
        </Link>
      </div>
    </div>
  );
}
