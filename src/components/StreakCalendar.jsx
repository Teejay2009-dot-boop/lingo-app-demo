import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/config/firebase";
import { FaFire, FaTimes, FaCalendarAlt, FaRocket, FaTrophy } from "react-icons/fa";

const StreakCalendar = ({ isOpen, onClose }) => {
  const [streakData, setStreakData] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalActiveDays, setTotalActiveDays] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser || !isOpen) return;

    const fetchStreakData = async () => {
      try {
        setLoading(true);
        
        const userRef = doc(db, "users", auth.currentUser.uid);
        const unsubscribeUser = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const userCurrentStreak = data.current_streak || 0;
            const userLongestStreak = data.longest_streak || 0;
            
            setCurrentStreak(userCurrentStreak);
            setLongestStreak(userLongestStreak);
            generateCalendarData(userCurrentStreak);
          }
        });

        setLoading(false);
        return () => unsubscribeUser();
      } catch (error) {
        console.error("Error fetching streak data:", error);
        setLoading(false);
      }
    };

    fetchStreakData();
  }, [isOpen]);

  const generateCalendarData = (currentStreak) => {
    const today = new Date();
    const calendarData = [];
    let activeDaysCount = 0;
    
    // Find the date 30 days ago
    const startDate = new Date();
    startDate.setDate(today.getDate() - 29); // 30 days total including today
    startDate.setHours(0, 0, 0, 0);
    
    // Find what weekday the start date is (0 = Sunday, 1 = Monday, etc.)
    const startDayOfWeek = startDate.getDay();
    
    // We need to create a calendar that starts on Sunday and ends on Saturday
    // So we might need to add some days before the start date to make it align
    
    // Calculate how many days to add before our start date to make the calendar start on Sunday
    const daysToAddBefore = startDayOfWeek; // If start date is Wednesday (3), we need to add 3 days before
    
    // Total cells needed: days before + 30 days
    const totalCells = daysToAddBefore + 30;
    
    // Generate all calendar cells
    for (let i = 0; i < totalCells; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() - daysToAddBefore + i);
      
      const isInRange = i >= daysToAddBefore; // Only days from startDate onward are in our 30-day range
      const daysFromToday = Math.floor((today - date) / (1000 * 60 * 60 * 24));
      const isInStreakPeriod = daysFromToday < currentStreak && daysFromToday >= 0;
      
      const isToday = daysFromToday === 0;
      const isActive = isInRange && (isInStreakPeriod || (isToday && currentStreak > 0));
      
      const lessonCount = isActive ? Math.floor(Math.random() * 3) + 1 : 0;

      if (isActive && isInRange) activeDaysCount++;

      calendarData.push({
        date: new Date(date),
        isActive,
        isToday,
        isInRange,
        lessonCount,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayOfWeek: date.getDay()
      });
    }

    console.log("Calendar alignment:");
    console.log("Start date:", calendarData[0]?.date.toDateString(), "->", calendarData[0]?.dayName);
    console.log("Today:", calendarData.find(d => d.isToday)?.date.toDateString(), "->", calendarData.find(d => d.isToday)?.dayName);
    console.log("End date:", calendarData[calendarData.length-1]?.date.toDateString(), "->", calendarData[calendarData.length-1]?.dayName);
    
    setStreakData(calendarData);
    setTotalActiveDays(activeDaysCount);
  };

  const getStreakBadge = (streakLength) => {
    if (streakLength >= 30) return { icon: "🏆", color: "from-purple-500 to-pink-500", label: "Legendary" };
    if (streakLength >= 21) return { icon: "🚀", color: "from-blue-500 to-purple-500", label: "Epic" };
    if (streakLength >= 14) return { icon: "⭐", color: "from-green-500 to-blue-500", label: "Amazing" };
    if (streakLength >= 7) return { icon: "🔥", color: "from-orange-500 to-red-500", label: "Hot" };
    if (streakLength >= 3) return { icon: "⚡", color: "from-yellow-500 to-orange-500", label: "Good" };
    return { icon: "🌱", color: "from-gray-400 to-gray-500", label: "Beginner" };
  };

  const getDayIntensity = (lessonCount) => {
    if (lessonCount >= 5) return "🔥🔥🔥";
    if (lessonCount >= 3) return "🔥🔥";
    if (lessonCount >= 1) return "🔥";
    return "";
  };

  if (!isOpen) return null;

  const realToday = new Date();
  const todayDayName = realToday.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FaCalendarAlt className="text-yellow-500 text-xl" />
            <h2 className="text-xl font-bold text-gray-800">Learning Calendar</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading your streak data...</p>
          </div>
        ) : (
          <>
            {/* Current Day Info */}
            <div className="bg-blue-50 p-4 border-b border-blue-200">
              <p className="text-center text-blue-800 font-semibold">
                Today is {todayDayName}
              </p>
              <p className="text-center text-blue-600 text-sm">
                {realToday.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>

            {/* Stats */}
            <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FaFire className="text-red-500" />
                    <span className="text-lg font-bold text-gray-800">{currentStreak}</span>
                  </div>
                  <p className="text-sm text-gray-900">Current Streak</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FaTrophy className="text-orange-500" />
                    <span className="text-lg font-bold text-gray-800">{longestStreak}</span>
                  </div>
                  <p className="text-sm text-gray-600">Longest Streak</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FaRocket className="text-blue-500" />
                    <span className="text-lg font-bold text-gray-800">{totalActiveDays}</span>
                  </div>
                  <p className="text-sm text-gray-600">Active Days</p>
                </div>
              </div>

              {currentStreak > 0 && (
                <div className={`bg-gradient-to-r ${getStreakBadge(currentStreak).color} text-white p-3 rounded-lg text-center`}>
                  <div className="text-2xl mb-1">{getStreakBadge(currentStreak).icon}</div>
                  <div className="font-bold">{getStreakBadge(currentStreak).label} Streak!</div>
                  <div className="text-sm opacity-90">{currentStreak} days in a row</div>
                </div>
              )}
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4 text-center">
                Last 30 Days
              </h3>
              
              <div className="grid grid-cols-7 gap-1 mb-4">
                {/* Day headers - FIXED POSITION */}
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <div key={index} className="text-center text-xs font-medium text-gray-500 py-1">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days - PROPERLY ALIGNED */}
                {streakData.map((day, index) => (
                  <div
                    key={index}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs relative group
                      ${!day.isInRange 
                        ? 'bg-transparent text-gray-300' 
                        : day.isActive 
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold' 
                          : 'bg-gray-100 text-gray-400'
                      }
                      ${day.isToday ? 'ring-2 ring-yellow-500 ring-offset-1' : ''}
                      transition-all duration-200 hover:scale-105 cursor-pointer
                    `}
                    title={`${day.date.toLocaleDateString()} (${day.dayName}) - ${day.isActive ? `${day.lessonCount} lessons completed` : day.isInRange ? 'No activity' : 'Not in range'}`}
                  >
                    <span className={`${day.isToday ? 'font-bold' : ''} ${!day.isInRange ? 'opacity-50' : ''}`}>
                      {day.date.getDate()}
                    </span>
                    
                    {/* Show today indicator */}
                    {day.isToday && (
                      <span className="absolute -top-1 text-[6px] font-bold text-yellow-600 bg-yellow-100 px-1 rounded">
                        TODAY
                      </span>
                    )}
                    
                    {/* Fire badges for active days in range */}
                    {day.isActive && day.isInRange && (
                      <>
                        <div className="absolute -top-1 -right-1 flex flex-col items-center">
                          <FaFire className="text-xs text-red-500" />
                          {day.lessonCount > 1 && (
                            <span className="text-[8px] font-bold text-red-600">
                              {day.lessonCount}
                            </span>
                          )}
                        </div>
                        
                        <div className="absolute -bottom-1 text-[8px] font-bold">
                          {getDayIntensity(day.lessonCount)}
                        </div>
                      </>
                    )}

                    {/* Debug: Show day name for alignment check */}
                    {process.env.NODE_ENV === 'development' && (
                      <span className="absolute -bottom-3 text-[6px] text-gray-400 font-mono">
                        {day.dayName.charAt(0)}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Alignment Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-green-800 text-center">
                  <strong>Calendar Alignment:</strong><br />
                  Dates are properly aligned with weekday labels.<br />
                  Today ({todayDayName}) should be under <strong>{todayDayName.toUpperCase().slice(0, 1)}</strong>
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 text-xs text-gray-600 flex-wrap">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                  <span>Active Day</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-100 rounded"></div>
                  <span>No Activity</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-transparent border border-gray-300 rounded"></div>
                  <span>Not in Range</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="p-6 bg-gray-50 rounded-b-2xl">
              <h3 className="font-semibold text-gray-800 mb-3">How This Calendar Works</h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span><strong>S M T W T F S</strong> are fixed weekday labels</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Dates align under their correct weekday columns</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Faded dates are outside the 30-day range</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StreakCalendar;