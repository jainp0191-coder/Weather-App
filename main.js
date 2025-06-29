window.addEventListener('DOMContentLoaded', () => {
  const dayBoxes = document.querySelectorAll('.day-weather-container');
  const locnChangeBtn = document.getElementById('locn-change-btn');
  const searchByLocn = document.querySelector('.search-by-locn');
  const dayMap = {
    Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday',
    Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday'
  };

  let inputfield = null;
  let searchBtn = null;

  const video = document.querySelector('.weather-video');
  const textOverlay = document.querySelector('.text-overlay');

  function updateShortDayNames() {
    const shortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    dayBoxes.forEach((box, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const shortDay = shortNames[date.getDay()];
      box.querySelector('h6.value-lg').textContent = shortDay;
    });
  }

  updateShortDayNames();

  let isFirstRender = true;

  // Hide video and overlay initially
  video.style.opacity = '0';
  textOverlay.style.opacity = '0';

  function renderData(data, location = null) {
    if (!isFirstRender) {
      video.classList.add('fade-out');
      textOverlay.classList.add('fade-out');
    }

    setTimeout(() => {
      if (location) {
        document.getElementById('location').innerHTML = location;
      }
      document.getElementById('day').textContent = data.day;
      document.getElementById('date').textContent = data.date;
      document.getElementById('weather-icon').src = data.weather_img;
      document.getElementById('temperature').innerHTML = data.temperature;
      document.getElementById('weather-condition').textContent = data.weather;
      const timePart = document.querySelector('h6.value-lg')?.textContent.split(' ')[0].slice(3);
      document.querySelector('.live-time').textContent = timePart;
      const values = document.querySelectorAll('.value');
      values[0].textContent = data.precipitation;
      values[1].textContent = data.humidity;
      values[2].textContent = data.wind;

      video.setAttribute('poster', data.weather_poster);
      video.setAttribute('src', data.weather_vid);
      video.load();

      video.addEventListener('loadeddata', () => {
        video.classList.remove('fade-out');
        textOverlay.classList.remove('fade-out');
        video.style.opacity = '1';
        textOverlay.style.opacity = '1';
        isFirstRender = false;
      }, { once: true });
    }, isFirstRender ? 0 : 300);
  }

  function extractDataFromBox(box, boxIndex) {
    
    const selectedDate = new Date(box.dataset.date);
    selectedDate.setDate(selectedDate.getUTCDate() + boxIndex);
    const shortDay = selectedDate.toLocaleDateString('en-us', {
        weekday: 'short',
        timezone: 'UTC'
    }); // Extract only the day part
    const fullDay = dayMap[shortDay] || 'Day';
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = selectedDate.toLocaleDateString('en-US', options);
    const img = box.querySelector('.weather-icon-sm').getAttribute('src');
    const temp = box.querySelector('.temp').innerHTML;

    return {
      date: formattedDate, day: fullDay, temperature: temp,
      weather_img: img, weather: box.dataset.condition || "",
      precipitation: box.dataset.precip || '0%',
      humidity: box.dataset.humidity || '0%',
      wind: box.dataset.wind || '0 km/h',
      weather_vid: box.dataset.video || './vids/sunny.mp4',
      weather_poster: box.dataset.poster || './posters/sunny.jpg'
    };
  }

  // Initial render with current condition
  const firstBox = document.getElementById('day-1');
  const initialData = extractDataFromBox(firstBox, 0);
  renderData(initialData);

  dayBoxes.forEach((box, idx) => {
    box.addEventListener('click', () => {
      dayBoxes.forEach(b => {
        b.classList.remove('active');
        box.style.transform = '';
      });
      setTimeout(() => box.classList.add('active'), 100);
      const data = extractDataFromBox(box, idx);
      renderData(data);
    });

    box.addEventListener('mouseenter', () => {
      if (!box.classList.contains('active')) {
        box.style.transform = 'translateY(-4px) scale(1.02)';
      }
    });
    box.addEventListener('mouseleave', () => {
      if (!box.classList.contains('active')) {
        box.style.transform = '';
      }
    });
  });

  function updateBoxWithWeatherData(box, weatherData, index, referenceHour, referenceMinutes, referenceDate) {
    const selectedDate = new Date(referenceDate);
    selectedDate.setDate(selectedDate.getUTCDate() + index);
    const shortDay = selectedDate.toLocaleDateString('en-us', {
        weekday: 'short',
        timezone: 'UTC'
    });
    const timeSlot = `${referenceHour}:${referenceMinutes.toString().padStart(2,'0')}`
    
    box.querySelector('h6.value-lg').innerHTML = `${shortDay}<br>${timeSlot}`; // e.g., "Mon 3:00 PM"
    box.querySelector('.temp').innerHTML = `${Math.round(weatherData.main.temp)}<sup>°</sup>C`;
    box.querySelector('.weather-icon-sm').src = `./icons/${weatherData.weather[0].icon}-white.png`;
    box.querySelector('.weather-icon2-sm').src = `./icons/${weatherData.weather[0].icon}-black.png`;
    box.dataset.date = referenceDate;
    box.dataset.precip = `${Math.round((weatherData.pop || 0) * 100)}%`;
    box.dataset.humidity = `${weatherData.main.humidity}%`;
    box.dataset.wind = `${weatherData.wind.speed} km/h`;
    box.dataset.condition = `${weatherData.weather[0].description}`;
    box.dataset.video = determineVideoFromCondition(weatherData.weather[0].main, weatherData.weather[0].icon).video;
    box.dataset.poster = determineVideoFromCondition(weatherData.weather[0].main, weatherData.weather[0].icon).poster;
  }

  function determineVideoFromCondition(condition, iconCode) {
    const isNight = iconCode.endsWith('n');  // e.g., "01n" means night
    const cond = condition.toLowerCase();

    const mediaMap = {
        clear: {
        video: isNight ? './vids/moony.mp4' : './vids/sunny.mp4',
        poster: isNight ? './posters/moony.jpg' : './posters/sunny.jpg'
        },
        clouds: {
        video: './vids/cloudy.mp4',
        poster: './posters/cloudy.jpg'
        },
        rain: {
        video: './vids/rainy.mp4',
        poster: './posters/rainy.jpg'
        },
        snow: {
        video: './vids/snowy.mp4',
        poster: './posters/snowy.jpg'
        },
        thunderstorm: {
        video: './vids/thunderstorm.mp4',
        poster: './posters/thunderstorm.jpg'
        },
        drizzle: {
        video: './vids/drizzle.mp4',
        poster: './posters/drizzle.jpg'
        },
        atmosphere: {
        video: './vids/fog.mp4',
        poster: './posters/fog.jpg'
        }
    };

    return mediaMap[cond] || {
        video: './vids/sunny.mp4',
        poster: './posters/sunny.jpg'
    };
  }

  async function fetchWeatherData(city) {
    const apiKey = 'bb2f6b8ac91dd0f2d74866cbe5ef9b62';
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('City not found');
    return await res.json();
  }

 function getConsistentDailyForecast(list, timezoneOffsetInSeconds) {
  // 1) Compute “now” in the city’s local clock
  const nowUtcMs = Date.now();
  const nowCityMs = nowUtcMs + timezoneOffsetInSeconds * 1000;
  const nowCity = new Date(nowCityMs);
  const cityHour = nowCity.getUTCHours();
  const cityMin  = nowCity.getUTCMinutes();

  // 2) Find the very next slot (smallest positive time difference mod 24h)
  let bestDiff = Infinity;
  let firstDayForecast = null;
  let referenceHour = null;
  let referenceMinutes = null;
  let referenceDate = null;

  for (const item of list) {
    // Parse the forecast’s UTC ms, then shift into city time
    const itemUtcMs  = Date.parse(item.dt_txt + 'Z');
    const itemCityMs = itemUtcMs + timezoneOffsetInSeconds * 1000;
    const itemCity   = new Date(itemCityMs);

    // Compute difference in minutes, mod 24h
    const diffMins = ((itemCity.getUTCHours() - cityHour) * 60 + 
                      (itemCity.getUTCMinutes() - cityMin) + 
                      24 * 60) % (24 * 60);

    // We want the smallest positive diff
    if (diffMins > 0 && diffMins < bestDiff) {
      bestDiff = diffMins;
      firstDayForecast = item;
      referenceHour    = itemCity.getUTCHours();
      referenceMinutes = itemCity.getUTCMinutes();
      referenceDate = itemCity.toISOString().slice(0,10);
    }
  }

  // 3) If we still didn’t find any (very unlikely unless list empty):
  if (!firstDayForecast) {
    console.warn("No future slot found.");
    return { forecasts: [], referenceHour: null, referenceMinutes: null };
  }

  // 4) Group by date
  const groupedByDate = list.reduce((acc, item) => {
    const dateKey = item.dt_txt.split(' ')[0];
    (acc[dateKey] = acc[dateKey] || []).push(item);
    return acc;
  }, {});

  // 5) Build the 5-day array, each day matching HH:MM
  const dates = Object.keys(groupedByDate).sort();
  const dailyForecasts = [];

  for (const dateKey of dates) {
    if (dailyForecasts.length >= 5) break;

    if (dailyForecasts.length === 0) {
      // First slot is the one we picked above
      dailyForecasts.push(firstDayForecast);
      continue;
    }

    // Find for this date the slot matching referenceHour & referenceMinutes
    const slot = groupedByDate[dateKey].find(item => {
      const ms    = Date.parse(item.dt_txt + 'Z') + timezoneOffsetInSeconds * 1000;
      const cityT = new Date(ms);
      return cityT.getUTCHours() === referenceHour &&
             cityT.getUTCMinutes() === referenceMinutes;
    });

    if (slot) {
      dailyForecasts.push(slot);
    }
  }

  return {
    forecasts: dailyForecasts,
    referenceHour,
    referenceMinutes,
    referenceDate
  };
}

  async function doSearch(city) {
    try {
      localStorage.setItem('lastCity', city);
      const data = await fetchWeatherData(city);
      const result = getConsistentDailyForecast(data.list, data.city.timezone);
      const forecast = result.forecasts;
      const referenceHour = result.referenceHour;
      const referenceMinutes = result.referenceMinutes;
      const referenceDate = result.referenceDate;

      console.log(result);
      forecast.forEach((obj, idx) => {
        updateBoxWithWeatherData(dayBoxes[idx], obj, idx, referenceHour, referenceMinutes, referenceDate);
      });
      const firstBoxData = extractDataFromBox(dayBoxes[0], 0);
      const location = `<i class="fas fa-map-marker-alt"></i> ${data.city.name}, ${data.city.country}`;
      renderData(firstBoxData, location);
      dayBoxes[0].click();
    } catch (e) {
      alert("City not found or API issue.");
      console.error(e);
    }
  }

  locnChangeBtn.addEventListener('click', () => {
    if (!inputfield) {
      inputfield = document.createElement('input');
      inputfield.setAttribute('id', 'locn-input');
      inputfield.setAttribute('placeholder', 'Enter location name...');
      searchByLocn.appendChild(inputfield);
      setTimeout(() => inputfield.classList.add('show'), 50);

      let inputTimeout;
      inputfield.addEventListener('input', () => {
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => {
          const existingBtn = document.getElementById('search-btn');
          if (inputfield.value.trim() !== '' && !existingBtn) {
            searchBtn = document.createElement('button');
            searchBtn.setAttribute('id', 'search-btn');
            searchBtn.innerHTML = '<i class="fas fa-search" style="color:white;font-size:16px;"></i>';
            searchByLocn.appendChild(searchBtn);
            setTimeout(() => searchBtn.classList.add('show'), 50);

            searchBtn.addEventListener('click', async () => {
              const city = inputfield.value.trim();
              if (city) {
                searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="color:white;font-size:16px;"></i>';
                await doSearch(city);
                searchBtn.innerHTML = '<i class="fas fa-search" style="color:white;font-size:16px;"></i>';
                hideSearchInterface();
              }
            });
          } else if (inputfield.value.trim() === '' && existingBtn) {
            existingBtn.classList.remove('show');
            setTimeout(() => existingBtn.remove(), 400);
            searchBtn = null;
          }
        }, 300);
      });

      inputfield.addEventListener('keypress', e => {
        if (e.key === 'Enter' && document.getElementById('search-btn')) {
          document.getElementById('search-btn').click();
        }
      });

      inputfield.addEventListener('keydown', e => {
        if (e.key === 'Escape') hideSearchInterface();
      });

    } else {
      inputfield.classList.toggle('show');
      if (inputfield.classList.contains('show')) inputfield.focus();
    }
  });

  function hideSearchInterface() {
    if (inputfield) {
      inputfield.classList.remove('show');
      const btn = document.getElementById('search-btn');
      if (btn) btn.classList.remove('show');
      setTimeout(() => {
        if (inputfield.parentNode) inputfield.remove();
        inputfield = null;
        if (btn && btn.parentNode) btn.remove();
        searchBtn = null;
      }, 400);
    }
  }

  const weatherIcon = document.getElementById('weather-icon');
  if (weatherIcon) {
    weatherIcon.addEventListener('mouseenter', () => {
      weatherIcon.style.transform = 'scale(1.1) rotate(10deg)';
    });
    weatherIcon.addEventListener('mouseleave', () => {
      weatherIcon.style.transform = 'scale(1) rotate(0deg)';
    });
  }

  window.addEventListener('load', () => {
    document.body.style.opacity = '1';
  });

  const savedCity = localStorage.getItem('lastCity');
  if (savedCity) {
    doSearch(savedCity);
  } else {
    doSearch("Raigarh");
  }
});