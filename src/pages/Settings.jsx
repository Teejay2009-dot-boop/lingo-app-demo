import React, { useState } from "react";
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

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    soundEffects: true,
    darkMode: false,
    autoPlayAudio: true,
    showProgress: true,
    dailyReminders: true,
    language: "english",
    theme: "light",
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

  const SettingToggle = ({ icon, label, setting, value }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <div className="text-amber-500 text-xl">{icon}</div>
        <div>
          <span className="text-gray-800 font-medium block">{label}</span>
          <span className="text-gray-500 text-sm">
            {value ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={value}
          onChange={() => handleSettingChange(setting)}
          className="sr-only peer"
        />
        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
      </label>
    </div>
  );

  const SettingSelect = ({ icon, label, setting, value, options }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <div className="text-amber-500 text-xl">{icon}</div>
        <span className="text-gray-800 font-medium">{label}</span>
      </div>
      <select
        value={value}
        onChange={(e) => handleSelectChange(setting, e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
      className={`flex items-center justify-between py-4 border-b border-gray-200 w-full text-left ${
        isDanger
          ? "text-red-500 hover:text-red-600"
          : "text-gray-800 hover:text-amber-500"
      } transition-colors`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`text-xl ${isDanger ? "text-red-500" : "text-gray-500"}`}
        >
          {icon}
        </div>
        <span className="font-medium">{label}</span>
      </div>
    </button>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
        {/* Header */}
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-amber text-2xl rounded-lg hover:bg-amber-50"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-3xl font-bold text-amber-600">Settings</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Preferences Section */}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Preferences
              </h2>

              <SettingToggle
                icon={<FaBell />}
                label="Push Notifications"
                setting="notifications"
                value={settings.notifications}
              />

              <SettingToggle
                icon={<FaVolumeUp />}
                label="Sound Effects"
                setting="soundEffects"
                value={settings.soundEffects}
              />

              <SettingToggle
                icon={settings.darkMode ? <FaMoon /> : <FaSun />}
                label="Dark Mode"
                setting="darkMode"
                value={settings.darkMode}
              />

              <SettingToggle
                icon={<FaVolumeUp />}
                label="Auto-play Audio"
                setting="autoPlayAudio"
                value={settings.autoPlayAudio}
              />

              <SettingToggle
                icon={<FaUser />}
                label="Show Progress"
                setting="showProgress"
                value={settings.showProgress}
              />

              <SettingToggle
                icon={<FaBell />}
                label="Daily Reminders"
                setting="dailyReminders"
                value={settings.dailyReminders}
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

              <SettingSelect
                icon={<FaPalette />}
                label="Theme"
                setting="theme"
                value={settings.theme}
                options={[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                  { value: "auto", label: "Auto" },
                ]}
              />
            </div>

            {/* Account Section */}
            <div className="p-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
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
            <div className="p-6 border-t border-gray-200">
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
            <p className="text-sm text-gray-500">
              SpeakSmart App • Version 1.0.0
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
