import { getUserLanguage, translations } from "../../lang/translation.js";
import config from "./../../config/config.js";
import Capitals from "./Capitals.js";
import CITY from "./City.js";

// focus the search input as the DOM loads
window.onload = function () {
  document.getElementsByName("search-bar")[0].focus();

  // fetch background
  fetchNewBackground();
};

function changeBackgroundImage() {
  fetchNewBackground();
}

const userLang = getUserLanguage() || "en-US";
const place = document.querySelector("#place");

for (let i in CITY) {
  let option = document.createElement("option");
  option.value = CITY[i];
  option.text = CITY[i];
  place.appendChild(option);
}

function formatAMPM(date) {
  return date.toLocaleString(translations[userLang].formattingLocale, {
    hour: '2-digit',
    minute: '2-digit'
  });
}

let isCelcius = true;
let selectedCity;
$(".checkbox").change(function () {
  isCelcius = !this.checked;
  weather.fetchWeather(selectedCity);
});

let weather = {
  fetchWeather: function (city) {
    let isCountry = false;
    let index;
    for (let i = 0; i < Capitals.length; i++) {
      if (Capitals[i].country.toUpperCase() === city.toUpperCase()) {
        isCountry = true;
        index = i;
        break;
      }
    }
    if (isCountry) {
      city = Capitals[index].city;
    }
    fetch(
      "https://api.openweathermap.org/data/2.5/weather?q=" +
        city +
        "&units=metric&appid=" +
        config.API_KEY +
        `&lang=${translations[userLang].apiLang}`
    )
      .then((response) => {
        if (!response.ok) {
          toastFunction(`${translations[userLang].noWeatherFound}`);
          document.getElementById("city").innerHTML = "City not Found";
          document.getElementById("temp").style.display = "none";
          document.querySelector(
            ".weather-component__data-wrapper"
          ).style.display = "none";
          throw new Error(`${translations[userLang].noWeatherFound}`);
        }
        
        return response.json();
      })
      .then((data) => {
        document.getElementById("temp").style.display = "block";
        document.querySelector(
          ".weather-component__data-wrapper"
        ).style.display = "block";
        this.displayWeather(data, city);
        console.log(data)
      });
  },

  displayWeather: function (data, city) {
    const { name } = data;
    const { icon, description } = data.weather[0];
    const { temp, humidity, temp_min, temp_max } = data.main;
    const { speed } = data.wind;
    const { sunrise, sunset } = data.sys;
    let date1 = new Date(sunrise * 1000);
    let date2 = new Date(sunset * 1000);
    const { lat, lon } = data.coord; 

    document
      .getElementById("icon")
      .addEventListener("click", changeBackgroundImage);

    document.getElementById("dynamic").innerText =
      `${translations[userLang].weatherIn} ` + name;

    document.getElementById("city").innerText =
      `${translations[userLang].weatherIn} ` + name;

    document.getElementById(
      "icon"
    ).src = `https://openweathermap.org/img/wn/${icon}.png`;

    document.getElementById("description").innerText = description;

    let temperature = temp;

    if (!isCelcius) {
      temperature = temperature * (9 / 5) + 32;
      temperature = (Math.round(temperature * 100) / 100).toFixed(2);
      temperature = temperature + "°F";
    } else {
      temperature = temperature + "°C";
    }
    document.getElementById("temp").innerText = temperature;

    document.getElementById(
      "humidity"
    ).innerText = `${translations[userLang].humidity}: ${humidity}%`;

    document.getElementById(
      "wind"
    ).innerText = `${translations[userLang].windSpeed}: ${speed}km/h`;

    document.getElementById("weather").classList.remove("loading");

// For temp_min
let tempMinDisplay = temp_min;
if (!isCelcius) {
  tempMinDisplay = (tempMinDisplay * 9/5) + 32;
  tempMinDisplay = (Math.round(tempMinDisplay * 100) / 100).toFixed(2);
  tempMinDisplay += "°F";
} else {
  tempMinDisplay += "°C";
}
document.getElementById("temp_min").innerText = `${translations[userLang].temp_min}: ${tempMinDisplay}`;

// For temp_max
let tempMaxDisplay = temp_max;
if (!isCelcius) {
  tempMaxDisplay = (tempMaxDisplay * 9/5) + 32;
  tempMaxDisplay = (Math.round(tempMaxDisplay * 100) / 100).toFixed(2);
  tempMaxDisplay += "°F";
} else {
  tempMaxDisplay += "°C";
}
document.getElementById("temp_max").innerText = `${translations[userLang].temp_max}: ${tempMaxDisplay}`;



    let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${config.API_KEY}`;
    getWeatherWeekly(url);
    document
     
      .addEventListener("click", function () {
        const message = `Weather in ${name} today
      Temperature: ${temperature},
      Humidity: ${humidity}%,
      Wind Speed: ${speed}km/hr,
      Min Temp :${temp_min}°C
      Max Temp :${temp_max}°C
      Sunrise: ${formatAMPM(date1)},
      Sunset: ${formatAMPM(date2)}.`;
      });
  },
  search: function () {
    if (document.querySelector(".weather-component__search-bar").value != "") {
      selectedCity = document.querySelector(
        ".weather-component__search-bar"
      ).value;
      this.fetchWeather(selectedCity);
      const apiKey = "OOjKyciq4Sk0Kla7riLuR2j8C9FwThFzKIKIHrpq7c27KvrCul5rVxJj";
      const apiUrl = `https://api.pexels.com/v1/search?query=${selectedCity}&orientation=landscape`;

      fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: apiKey,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const randomIndex = Math.floor(Math.random() * 10);
          const url = data.photos[randomIndex].src.large2x;
          document.getElementById(
            "background"
          ).style.backgroundImage = `url(${url})`;
        })
        .catch((error) => {
          console.error(error);
        });
      //url = "";
    } else {
      toastFunction(translations[userLang].pleaseAddLocation);
    }
  },
};

async function getWeatherWeekly(url) {
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      showWeatherData(data);
    });
}

function generateWeatherItem(dayString, iconName, avgTemperature, description) {
  let container = document.createElement("div");
  container.className = "forecast-component__item rounded text-center";

  let day = document.createElement("div");
  day.innerText = dayString;
  day.style.color = "#00dcff";
  day.style.fontFamily = "Inter";
  day.style.fontWeight = "bolder";
  day.style.textTransform = "uppercase";
  day.style.fontSize = "20px";

  let newDiv = document.createElement("div");
  newDiv.className = "image-wrapper";

  let icon = document.createElement("img");
  icon.src = `https://openweathermap.org/img/wn/${iconName}.png`;

  let avgTempDisplay = avgTemperature;
if (!isCelcius) {
  avgTempDisplay = (avgTempDisplay * 9/5) + 32;
  avgTempDisplay = (Math.round(avgTempDisplay * 100) / 100).toFixed(2);
  avgTempDisplay += "°F";
} else {
  avgTempDisplay += "°C";
}

  let avgTemp = document.createElement("div");
  avgTemp.classList.add("weather-forecast-day");
  avgTemp.innerHTML = `${translations[userLang].avg_temp} ${avgTempDisplay}`;
  avgTemp.style.fontFamily = "Inter";
  avgTemp.style.fontWeight = "bolder";
  avgTemp.style.textTransform = "uppercase";

  let desc = document.createElement("div");
  desc.innerText = description;
  desc.style.fontFamily = "Inter";
  desc.style.fontWeight = "bolder";
  desc.style.textTransform = "uppercase";

  container.appendChild(day);
  container.appendChild(newDiv);
  newDiv.appendChild(icon);
  container.appendChild(avgTemp);
  container.appendChild(desc);
  return container;
}

function showWeatherData(data) {
  let container = document.getElementById("weather-forecast");
  container.innerHTML = "";
  data.daily.slice(1, 6).forEach((day, idx) => {
    let dayString = window.moment(day.dt * 1000).format("dddd");
    let element = generateWeatherItem(
      translations[userLang][dayString.toLowerCase()],
      day.weather[0].icon,
      day.temp.day,
      day.weather[0].description
    );
    showCurrDay(dayString, element);
    container.appendChild(element);
  });
}

//toast function
function toastFunction(val) {
  var x = document.getElementById("toast");
  x.className = "show";
  //change inner text
  document.getElementById("toast").innerText = val;
  setTimeout(function () {
    x.className = x.className.replace("show", "");
  }, 3000);
}
document
  .querySelector(".weather-component__search button")
  .addEventListener("click", function () {
    weather.search();
  });

document
  .querySelector(".weather-component__search-bar")
  .addEventListener("keyup", function (event) {
    if (event.key == "Enter") {
      weather.search();
    }
  });

// get user city name via ip api

fetch("https://ipapi.co/json/")
  .then((response) => response.json())
  .then((data) => {
    selectedCity = data.city;
    weather.fetchWeather(data.city);
  });

document.getElementsByName("search-bar")[0].placeholder =
  translations[userLang].search;

// SHOWS CURRENT DAY IN THE RENDERED DAYS
function showCurrDay(dayString, element) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const date = new Date();
  const dayName = days[date.getDay()];
  if (dayString === dayName) {
    element.classList.add("forecast-component__item-current-day");
  }
}

// Script for Live Time using SetInterval
var a;
var time;
const weekday = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const month = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const formatLeadingZero=(value)=>{
    //to add leading zeros if value is less than 10
    return value.toString().padStart(2, '0');
}
setInterval(() => {
  a = new Date();
  time =
    weekday[a.getDay()] +
    "  " +
    a.getDate() +
    "  " +
    month[a.getMonth()] +
    " " +
    a.getFullYear() +
    ", " +
    '  "Clock: ' +
    formatLeadingZero(a.getHours()) +
    ":" +
    formatLeadingZero(a.getMinutes()) +
    ":" +
    formatLeadingZero(a.getSeconds()) +
    '"';
  document.getElementById("date-time").innerHTML = time;
}, 1000);

//Fetching Random Landscape Background Image From Unsplash
const fetchNewBackground = () => {
  let url = `https://source.unsplash.com/${
    window.innerWidth < 768 ? "720x1280" : "1600x900"
  }/?landscape`;
  const bgElement = document.getElementById("background");
  bgElement.style.backgroundImage = `url(${url})`;
};

let follower = document.getElementById("circle");
let timer = null;

window.addEventListener("mousemove", function (details) {
  let y = details.clientY;
  let x = details.clientX;
  if (timer) {
    clearTimeout(timer);
  }
  if (follower) {
    timer = setTimeout(function () {
      follower.style.top = `${y}px`;
      follower.style.left = `${x}px`;
    }, 50);
  }
});
