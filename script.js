let key = "2f745fa85d563da5adb87b6cd4b81caf";

let show = document.getElementById("show");
let cityInput = document.getElementById("city");

// 🌍 AUTO LOCATION
navigator.geolocation.getCurrentPosition(pos=>{
  getWeatherByCoords(pos.coords.latitude,pos.coords.longitude);
});

// 🔍 SEARCH
document.getElementById("search").onclick=()=>{
  getWeather(cityInput.value);
};

// 🎙 VOICE
document.getElementById("voice").onclick=()=>{
  let rec=new webkitSpeechRecognition();
  rec.start();
  rec.onresult=e=>{
    let city=e.results[0][0].transcript;
    cityInput.value=city;
    getWeather(city);
  }
};

// 🌙 DARK MODE
document.getElementById("toggle").onclick=()=>{
  document.body.classList.toggle("dark");
};

// 📡 WEATHER
function getWeather(city){
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=metric`)
  .then(res=>res.json())
  .then(data=>{
    updateUI(data);
    getForecast(city);
    initMap(data.coord.lat,data.coord.lon);
  });
}

// 📍 COORD
function getWeatherByCoords(lat,lon){
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`)
  .then(res=>res.json())
  .then(data=>{
    updateUI(data);
    getForecast(data.name);
    initMap(lat,lon);
  });
}

// 🎯 UI UPDATE
function updateUI(data){
  let weather=data.weather[0].main.toLowerCase();

  document.body.className="";
  if(weather.includes("cloud")) document.body.classList.add("cloudy");
  else if(weather.includes("rain")) {
    document.body.classList.add("rainy");
    createRain();
  }
  else if(weather.includes("clear")) document.body.classList.add("sunny");
  else document.body.classList.add("night");

  show.innerHTML=`
    <div class="card">
      <h2>${data.name}</h2>
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
      <h1>${Math.round(data.main.temp)}°C</h1>
      <p>${data.weather[0].main}</p>

      <div class="row">
        <div>💧 ${data.main.humidity}%</div>
        <div>🌬 ${data.wind.speed} km/h</div>
      </div>
    </div>
  `;
}

// 🌧 RAIN EFFECT
function createRain(){
  let rain=document.getElementById("rain");
  rain.innerHTML="";
  for(let i=0;i<100;i++){
    let drop=document.createElement("div");
    drop.className="drop";
    drop.style.left=Math.random()*100+"%";
    drop.style.animationDuration=(Math.random()+0.5)+"s";
    rain.appendChild(drop);
  }
}

// 📊 FORECAST
function getForecast(city){
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}&units=metric`)
  .then(res=>res.json())
  .then(data=>{
    let html="<div class='forecast'>";
    for(let i=0;i<data.list.length;i+=8){
      let d=data.list[i];
      html+=`
        <div>
          <p>${new Date(d.dt_txt).toDateString().slice(0,3)}</p>
          <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}.png">
          <p>${Math.round(d.main.temp)}°C</p>
        </div>
      `;
    }
    html+="</div>";
    show.innerHTML+=html;
  });
}

// 🗺 MAP
function initMap(lat,lon){
  let map=L.map('map').setView([lat,lon],10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  L.marker([lat,lon]).addTo(map);
}