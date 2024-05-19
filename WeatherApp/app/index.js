import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Platform, View, SafeAreaView, Text, TouchableOpacity, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import SearchBar from '../components/SearchBar.component';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';
import { fetchWeatherForecast, fetchLocations, fetchFutureWeather, fetchHistoricalWeather } from '../api/weather'; // Update the path as necessary
import { MapPinIcon, CalendarDaysIcon } from 'react-native-heroicons/solid';
import { weatherImages } from '@/constants/apiKeys';
import dayjs from 'dayjs';

const screenHeight = Dimensions.get('screen').height;
const screenWidth = Dimensions.get('screen').width;

export default function HomeScreen() {
  const [location, setLocation] = useState('');
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true); // Initial loading state set to true
  const [currentWeather, setCurrentWeather] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    (async () => {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        setErrorMessage('Please turn on internet to access the app');
        setLoading(false);
        return;
      } else {
        setErrorMessage(null);
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage('Permission to access location was denied. Please enable location permissions to use this app.');
        setLoading(false);
        return;
      } else {
        setErrorMessage(null);
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      const city = geocode[0].city;
      handleLocation({ name: city });
    })();
  }, []);

  const handleLocation = async (loc) => {
    toggleSearch(false);
    setLocation(loc);

    // Fetch current weather
    const currentWeatherData = await fetchWeatherForecast({ cityName: loc.name, days: 7 });
    setCurrentWeather(currentWeatherData);
    console.log('current : ',currentWeatherData);

    // Fetch past and future weather data
    const pastWeatherPromises = [];
    for (let i = 1; i <= 7; i++) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      pastWeatherPromises.push(fetchHistoricalWeather(loc.name, date));
    }
    const pastWeatherData = await Promise.all(pastWeatherPromises);

    const combinedWeatherData = [
      ...pastWeatherData.reverse().map((data) => ({
        date: data.forecast.forecastday[0].date,
        condition: data.forecast.forecastday[0].day.condition.text,
        maxTemp: data.forecast.forecastday[0].day.maxtemp_c,
        minTemp: data.forecast.forecastday[0].day.mintemp_c,
        icon: data.forecast.forecastday[0].day.condition.icon,
      })),
      ...currentWeatherData.forecast.forecastday.map((data) => ({
        date: data.date,
        condition: data.day.condition.text,
        maxTemp: data.day.maxtemp_c,
        minTemp: data.day.mintemp_c,
        icon: data.day.condition.icon,
      })),
    ];
    setWeatherData(combinedWeatherData);
    setLoading(false);
  };

  const handleSearch = async (query) => {
    if (query.length > 2) {
      const locationResults = await fetchLocations({ cityName: query });
      setLocations(locationResults);
      toggleSearch(true);
    } else {
      setLocations([]);
    }
  };

  const DayItem = (data) => {
    return (
      <View style={styles.cardView}>
        <Image source={weatherImages[data?.item?.condition]} style={styles.cardImage} />
        <Text style={styles.cardDayText}>{data?.item?.date}</Text>
        <Text style={styles.cardTemp}>{data?.item?.maxTemp}° - {data?.item?.minTemp}°</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image source={require('../assets/images/backGround3.jpg')} style={styles.backgroundImage} blurRadius={90} />
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : (
        <SafeAreaView style={styles.container}>
          <SearchBar onChange={handleSearch} showSearch={showSearch} toggleSearch={toggleSearch} />
          {locations.length > 0 && showSearch ? (
            <View style={styles.locationList}>
              {locations.map((loc, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.location, { borderBottomWidth: index + 1 === locations.length ? 0 : 1 }]}
                  onPress={() => handleLocation(loc)}
                >
                  <MapPinIcon size="20" color="tomato" />
                  <Text style={{ color: '#000', marginLeft: 2 }}>{loc?.name}, {loc?.region}, {loc?.country}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
          <Text style={styles.city}>{currentWeather?.location?.name},<Text style={styles.country}> {currentWeather?.location?.country}</Text></Text>
          <Image source={weatherImages[currentWeather?.current?.condition?.text]} style={styles.weatherImage} />
          <Text style={styles.temp}>{currentWeather?.current?.temp_c}°C</Text>
          <Text style={styles.description}>{currentWeather?.current?.condition?.text}</Text>
          <View style={styles.rowView}>
            <View style={styles.innerRow}>
              <Image source={require('../assets/images/icons/wind.png')} style={styles.rowIcon} />
              <Text style={styles.rowText}>{currentWeather?.current?.wind_kph}km</Text>
            </View>
            <View style={styles.innerRow}>
              <Image source={require('../assets/images/icons/drop.png')} style={styles.rowIcon} />
              <Text style={styles.rowText}>{currentWeather?.current?.humidity}%</Text>
            </View>
          </View>
          <View style={styles.forecastContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CalendarDaysIcon size={screenHeight * 0.03} color="#fff" />
              <Text style={styles.forecastText}>Forecast</Text>
            </View>
            <FlatList
              data={weatherData}
              horizontal
              renderItem={DayItem}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={<View style={{ width: 15 }} />}
            />
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    height: '100%',
    width: '100%',
    position: 'absolute',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationList: {
    backgroundColor: 'lightgray',
    marginHorizontal: 16,
    borderRadius: 20,
    position: 'absolute',
    width: screenWidth - 32,
    marginTop: screenHeight * 0.15,
    zIndex: 1,
  },
  location: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  city: {
    fontSize: 28,
    color: '#fff',
    alignSelf: 'center',
  },
  country: {
    fontSize: 24,
    color: 'lightgray',
    letterSpacing: 1,
  },
  weatherImage: {
    height: screenHeight * 0.25,
    width: screenHeight * 0.25,
    alignSelf: 'center',
    marginTop: screenHeight * 0.05,
  },
  temp: {
    fontSize: 60,
    color: '#fff',
    marginTop: screenHeight * 0.03,
    alignSelf: 'center',
  },
  description: {
    fontSize: 18,
    alignSelf: 'center',
    marginTop: screenHeight * 0.01,
    color: 'lightgray',
    letterSpacing: 1,
  },
  rowView: {
    flexDirection: 'row',
    marginTop: screenHeight * 0.05,
    justifyContent: 'space-around',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  rowIcon: {
    height: screenHeight * 0.03,
    width: screenHeight * 0.03,
  },
  rowText: {
    marginLeft: 5,
    color: '#fff',
    fontSize:  16,
  },
  forecastContainer: {
    marginTop: screenHeight * 0.05,
    paddingHorizontal: 16,
  },
  forecastText: {
    fontSize: 18,
    color: 'lightgray',
    marginLeft: 10,
  },
  cardView: {
    marginTop: screenHeight * 0.03,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center'
  },
  cardImage: {
    height: screenHeight * 0.05,
    width: screenHeight * 0.05,
  },
  cardDayText: {
    color: '#fff',
    marginVertical: 5,
    fontSize: 16,
    
  },
  cardTemp: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold', 
  }
});
