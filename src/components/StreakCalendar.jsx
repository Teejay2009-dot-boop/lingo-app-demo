import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/config/firebase";
import { FaFire, FaTimes, FaCalendarAlt } from "react-icons/fa";

const StreakCalendar = ({ isOpen, onClose }) => {
  const [streakData, setStreakData] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    if (!auth.currentUser || !isOpen) return;

    const streakMetaRef = doc(db, `users/${auth.currentUser.uid}/meta`, "streak");
    
    const unsubscribe = onSnapshot(streakMetaRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setCurrentStreak(data.streak || 0);
        setLongestStreak(data.longestStreak || 0);
        
        // Generate mock calendar data for demonstration
        // In a real app, you'd fetch this from Firestore
        generateCalendarData(data.streak || 0);
      }
    });

    return () => unsubscribe();
  }, [isOpen]);

  const generateCalendarData = (streak) => {
    // Generate last 30 days of streak data
    const today = new Date();
    const calendarData = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Mock data - in real app, check if user was active that day
      const isActive = i < streak; // Last 'streak' days are active
      const isToday = i === 0;
      
      calendarData.push({
        date,
        isActive,
        isToday
      });
    }
    
    setStreakData(calendarData);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FaCalendarAlt className="text-amber-500 text-xl" />
            <h2 className="text-xl font-bold text-gray-800">Streak Calendar</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Stats */}
        <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FaFire className="text-red-500" />
                <span className="text-lg font-bold text-gray-800">{currentStreak}</span>
              </div>
              <p className="text-sm text-gray-600">Current Streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FaFire className="text-orange-500" />
                <span className="text-lg font-bold text-gray-800">{longestStreak}</span>
              </div>
              <p className="text-sm text-gray-600">Longest Streak</p>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {/* Day headers */}
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={index} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {streakData.map((day, index) => (
              <div
                key={index}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs relative
                  ${day.isActive 
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold' 
                    : 'bg-gray-100 text-gray-400'
                  }
                  ${day.isToday ? 'ring-2 ring-amber-500 ring-offset-1' : ''}
                `}
              >
                <span>{day.date.getDate()}</span>
                {day.isActive && (
                  <FaFire className="text-xs absolute -top-1 -right-1 text-red-500" />
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-amber-400 rounded"></div>
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-100 rounded"></div>
              <span>Inactive</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="p-6 bg-gray-50 rounded-b-2xl">
          <h3 className="font-semibold text-gray-800 mb-2">Keep Your Streak Going! 🔥</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Complete at least one lesson daily</li>
            <li>• Use streak freezes if you miss a day</li>
            <li>• Longer streaks earn more bonuses!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar;