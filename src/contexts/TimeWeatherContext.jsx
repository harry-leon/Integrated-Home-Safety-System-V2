import React, { createContext, useContext, useState, useEffect } from 'react';

const TimeWeatherContext = createContext();

export const TimeWeatherProvider = ({ children }) => {
  const [timeStr, setTimeStr] = useState('--:--:--');
  const [dateStr, setDateStr] = useState('Đang tải ngày...');
  const [weather, setWeather] = useState({ temp: '--', desc: 'Đang tải...', icon: 'sync' });

  // Update Time and Date every second
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      setTimeStr(now.toLocaleTimeString('vi-VN', timeOptions));

      const dateOptions = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
      const dStr = now.toLocaleDateString('vi-VN', dateOptions);
      setDateStr(dStr.charAt(0).toUpperCase() + dStr.slice(1));
    };
    
    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Fetch Weather API
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const lat = 21.0285;
        const lon = 105.8542;
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`);
        const data = await res.json();
        
        const t = data.current.temperature_2m;
        const code = data.current.weather_code;
        
        let desc = "Không rõ";
        let icon = "cloud";

        if (code === 0) { desc = "Trời quang"; icon = "sunny"; }
        else if (code >= 1 && code <= 3) { desc = "Nhiều mây"; icon = "partly_cloudy_day"; }
        else if (code >= 45 && code <= 48) { desc = "Có sương mù"; icon = "foggy"; }
        else if (code >= 51 && code <= 67) { desc = "Mưa nhẹ"; icon = "rainy"; }
        else if (code >= 71 && code <= 77) { desc = "Tuyết rơi"; icon = "weather_snowy"; }
        else if (code >= 80 && code <= 82) { desc = "Mưa rào"; icon = "rainy"; }
        else if (code >= 95 && code <= 99) { desc = "Giông bão"; icon = "thunderstorm"; }
        
        setWeather({ temp: Math.round(t), desc, icon });
      } catch (error) {
        console.error("Lỗi khi tải thời tiết", error);
        setWeather({ temp: '--', desc: "Lỗi kết nối", icon: "cloud_off" });
      }
    };

    fetchWeather();
    const wInterval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(wInterval);
  }, []);

  return (
    <TimeWeatherContext.Provider value={{ timeStr, dateStr, weather }}>
      {children}
    </TimeWeatherContext.Provider>
  );
};

export const useTimeWeather = () => useContext(TimeWeatherContext);
