

const SettingsList = ({ title, settings, selectedSetting, handleSelect }) => {
  return (
    <div className="bg-gray-200 shadow-lg rounded-2xl p-6 gap-4 mt-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <ul className="space-y-2 text-gray-700">
        {settings.map((setting, idx) => {
          // Check if setting is a group
          if (typeof setting === "object" && setting.group && setting.items) {
            return (
              <li key={idx}>
                <h4 className="font-semibold text-sm mb-1 bg-gray-100/60  py-2 px-4 rounded-2xl shadow-md">{setting.group}</h4>
                <ul className="ml-4 space-y-1">
                  {setting.items.map((subItem, subIdx) => (
                    <li
                      key={subIdx}
                      onClick={() => handleSelect(subItem)}
                      className={`flex items-center cursor-pointer px-4 py-2 rounded-xl transition mt-2 ${
                        selectedSetting === subItem
                          ? "bg-green-300 font-bold"
                          : "hover:bg-gray-300 "
                      }`}
                    >
                      <svg className="w-4 h-4 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                      </svg>
                      {subItem}
                    </li>
                  ))}
                </ul>
              </li>
            );
          } else {
            // Simple flat item
            return (
              <li
                key={idx}
                onClick={() => handleSelect(setting)}
                className={`flex items-center cursor-pointer px-4 py-3 rounded-xl transition ${
                  selectedSetting === setting
                    ? "bg-green-300 font-bold"
                    : "hover:bg-gray-300"
                }`}
              >
                <svg className="w-4 h-4 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                </svg>
                {setting}
              </li>
            );
          }
        })}
      </ul>
    </div>
  );
};


export default SettingsList