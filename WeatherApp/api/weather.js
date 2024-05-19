import axios from 'axios';
import { apiKey } from '../constants/apiKeys';

const forecastEndPoint = params => `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.cityName}&days=${parseInt(params.days)}&aqi=no&alerts=no`;
const locationEndPoint = params => `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.cityName}`;
// const futureEndPoint = params => `https://api.weatherapi.com/v1/future.json?key=${apiKey}&q=${params.cityName}&dt=${params.date}`
const historyEndPoint = (cityName, date) => `https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${cityName}&dt=${date}`
const apiCall = async (endpoint) => {
    const options = {
        method: 'GET',
        url: endpoint,
    }
    try{
        const response = await axios(options);
        return response.data;
    }
    catch(err){
        console.log('Error: ',err);
        return null;
    }
}

export const fetchWeatherForecast = async params => {
    console.log(params);
    let forecastUrl = forecastEndPoint(params);
    console.log(forecastUrl);
    return await apiCall(forecastUrl);
}

export const fetchLocations = async params => {
    let locationsUrl = locationEndPoint(params);
    return await apiCall(locationsUrl);
}

// export const fetchFutureWeather = async params => {
//     const forecastUrl = futureEndPoint(params);
//     console.log('future',forecastUrl);
//     return await apiCall(forecastUrl);
// }

export const fetchHistoricalWeather = async (cityName, date) => {
    const historicalUrl = historyEndPoint(cityName, date);
    return await apiCall(historicalUrl);
}