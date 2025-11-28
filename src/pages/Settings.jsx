import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBell,
  FaMoon,
  FaSun,
  FaVolumeUp,
  FaVolumeMute,
  FaUser,
  FaQuestionCircle,
  FaSignOutAlt,
  FaPalette,
  FaLanguage,
} from "react-icons/fa";

import { auth } from "../firebase/config/firebase";
import { useTheme } from "../contexts/ThemeContext";



const Settings = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [settings, setSettings] = useState({
    notifications: true,
    soundEffects: true,
    autoPlayAudio: true,
    showProgress: true,
    dailyReminders: true,
    language: "english",
  });

  const handleSettingChange = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSelectChange = (setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const SettingToggle = ({ icon, label, setting, value, onChange }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <div className="text-amber-500 dark:text-amber-400 text-xl">{icon}</div>
        <div>
          <span className="text-gray-800 dark:text-gray-200 font-medium block">
            {label}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {value ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={value}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 dark:peer-checked:bg-amber-600 dark:bg-gray-700"></div>
      </label>
    </div>
  );

  const SettingSelect = ({ icon, label, setting, value, options }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <div className="text-amber-500 dark:text-amber-400 text-xl">{icon}</div>
        <span className="text-gray-800 dark:text-gray-200 font-medium">
          {label}
        </span>
      </div>
      <select
        value={value}
        onChange={(e) => handleSelectChange(setting, e.target.value)}
        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const SettingButton = ({ icon, label, onClick, isDanger = false }) => (
    <button
      onClick={onClick}
      className={`flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 w-full text-left ${
        isDanger
          ? "text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
          : "text-gray-800 dark:text-gray-200 hover:text-amber-500 dark:hover:text-amber-400"
      } transition-colors`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`text-xl ${
            isDanger
              ? "text-red-500 dark:text-red-400"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {icon}
        </div>
        <span className="font-medium">{label}</span>
      </div>
    </button>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-10 px-4 transition-colors duration-300">
        {/* Header */}
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-amber-600 dark:text-amber-400 text-2xl rounded-lg hover:bg-amber-50 dark:hover:bg-gray-800 transition-colors"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              Settings
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
            {/* Preferences Section */}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Preferences
              </h2>

              <SettingToggle
                icon={<FaBell />}
                label="Push Notifications"
                setting="notifications"
                value={settings.notifications}
                onChange={() => handleSettingChange("notifications")}
              />

              <SettingToggle
                icon={<FaVolumeUp />}
                label="Sound Effects"
                setting="soundEffects"
                value={settings.soundEffects}
                onChange={() => handleSettingChange("soundEffects")}
              />

              {/* Dark Mode Toggle - Special one that uses our theme context */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="text-amber-500 dark:text-amber-400 text-xl">
                    {isDark ? <FaMoon /> : <FaSun />}
                  </div>
                  <div>
                    <span className="text-gray-800 dark:text-gray-200 font-medium block">
                      Dark Mode
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {isDark ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDark}
                    onChange={toggleTheme}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 dark:peer-checked:bg-amber-600 dark:bg-gray-700"></div>
                </label>
              </div>

              <SettingToggle
                icon={<FaVolumeUp />}
                label="Auto-play Audio"
                setting="autoPlayAudio"
                value={settings.autoPlayAudio}
                onChange={() => handleSettingChange("autoPlayAudio")}
              />

              <SettingToggle
                icon={<FaUser />}
                label="Show Progress"
                setting="showProgress"
                value={settings.showProgress}
                onChange={() => handleSettingChange("showProgress")}
              />

              <SettingToggle
                icon={<FaBell />}
                label="Daily Reminders"
                setting="dailyReminders"
                value={settings.dailyReminders}
                onChange={() => handleSettingChange("dailyReminders")}
              />

              <SettingSelect
                icon={<FaLanguage />}
                label="Language"
                setting="language"
                value={settings.language}
                options={[
                  { value: "english", label: "English" },
                  { value: "spanish", label: "Spanish" },
                  { value: "french", label: "French" },
                ]}
              />
            </div>

            {/* Account Section */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Account
              </h2>

              <SettingButton
                icon={<FaUser />}
                label="Edit Profile"
                onClick={() => navigate("/profile/edit")}
              />

              <SettingButton
                icon={<FaVolumeMute />}
                label="Privacy & Security"
                onClick={() => console.log("Privacy settings")}
              />

              <SettingButton
                icon={<FaQuestionCircle />}
                label="Help & Support"
                onClick={() => console.log("Help")}
              />
            </div>

            {/* Logout Section */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <SettingButton
                icon={<FaSignOutAlt />}
                label="Log Out"
                onClick={handleLogout}
                isDanger={true}
              />
            </div>
          </div>

          {/* App Version */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              SpeakSmart App • Version 1.0.0
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
