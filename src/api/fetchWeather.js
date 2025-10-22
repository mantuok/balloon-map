import { fetchWeatherApi } from 'openmeteo';

const FetchWeather = async (long, lat) => {
  const params = {
	"latitude": lat,
	"longitude": long,
	"hourly": "temperature_2m",
  };

  const url = "https://api.open-meteo.com/v1/forecast";

  const responses = await fetchWeatherApi(url, params);
  const response = responses[0];
  const utcOffsetSeconds = response.utcOffsetSeconds();

  const hourly = response.hourly();

  const weatherData = {
    hourly: {
      time: [...Array((Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval())].map(
        (_, i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000)
      ),
      temperature_2m: hourly.variables(0).valuesArray(),
    },
  };

  return weatherData.hourly;
}

export default FetchWeather;