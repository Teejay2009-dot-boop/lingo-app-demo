import React from "react";

const NotificationFeed = ({ notifications }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-8">
      <h3 className="font-bold text-lg mb-4 text-gray-800">Notifications</h3>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No new notifications.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification, index) => (
            <li
              key={index}
              className="bg-gray-50 p-3 rounded-md shadow-sm flex items-start space-x-3 animate-fade-in"
            >
              <span className="text-xl">
                {notification.type === "level-up" ? "🎉" : "🏆"}
              </span>
              <div>
                <p className="text-gray-700 font-medium">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notification.timestamp).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationFeed;
