import { useCallback, useEffect, useState } from "react";

import {
    FiMapPin,
    FiSearch,
    FiDroplet,
    FiWind,
    FiSun,
} from "react-icons/fi";

import {
    getCurrentWeather,
    getForecast,
} from "../services/weatherApi";

import LocationButton from "../components/LocationButton";

import "./Home.css";


const DEFAULT_CITY = "Samarqand";


const Home = () => {

    const [weather, setWeather] = useState(null);

    const [hourly, setHourly] = useState([]);

    const [forecast, setForecast] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ========================================
    // UPDATE FORECAST
    // ========================================

    const updateForecast = useCallback(
        async (latitude, longitude) => {

            const lat = Number(latitude);
            const lon = Number(longitude);


            if (
                !Number.isFinite(lat) ||
                !Number.isFinite(lon)
            ) {

                setHourly([]);
                setForecast([]);

                return;

            }


            try {

                const forecastData =
                    await getForecast(lat, lon);


                setHourly(
                    Array.isArray(
                        forecastData?.hourly
                    )
                        ? forecastData.hourly.slice(0, 12)
                        : []
                );


                setForecast(
                    Array.isArray(
                        forecastData?.daily
                    )
                        ? forecastData.daily.slice(0, 5)
                        : []
                );


            } catch (forecastError) {

                console.warn(
                    "Forecast unavailable:",
                    forecastError
                );


                setHourly([]);
                setForecast([]);

            }

        },
        []
    );


    // ========================================
    // APPLY WEATHER
    // ========================================

    const applyWeather = useCallback(
        async (weatherData) => {

            if (!weatherData) {

                throw new Error(
                    "Weather data is unavailable."
                );

            }


            setWeather(weatherData);


            const latitude =
                weatherData?.coord?.lat;

            const longitude =
                weatherData?.coord?.lon;


            await updateForecast(
                latitude,
                longitude
            );

        },
        [updateForecast]
    );


    // ========================================
    // LOAD WEATHER BY CITY
    // ========================================

    const loadWeather = useCallback(
        async (city) => {

            const cleanCity =
                city?.trim();


            if (!cleanCity) {
                return;
            }


            try {

                setLoading(true);

                setError("");


                const currentWeather =
                    await getCurrentWeather(
                        cleanCity
                    );


                await applyWeather(
                    currentWeather
                );


            } catch (weatherError) {

                console.error(
                    "Weather error:",
                    weatherError
                );


                setWeather(null);

                setHourly([]);

                setForecast([]);


                setError(
                    weatherError?.message ||
                    "Unable to load weather data."
                );


            } finally {

                setLoading(false);

            }

        },
        [applyWeather]
    );


    // ========================================
    // INITIAL WEATHER
    // ========================================

    useEffect(() => {

        let cancelled = false;


        const initializeWeather = async () => {

            try {

                setLoading(true);

                setError("");


                const currentWeather =
                    await getCurrentWeather(
                        DEFAULT_CITY
                    );


                if (cancelled) {
                    return;
                }


                setWeather(
                    currentWeather
                );


                const latitude =
                    currentWeather?.coord?.lat;

                const longitude =
                    currentWeather?.coord?.lon;


                const forecastData =
                    await getForecast(
                        Number(latitude),
                        Number(longitude)
                    );


                if (cancelled) {
                    return;
                }


                setHourly(
                    Array.isArray(
                        forecastData?.hourly
                    )
                        ? forecastData.hourly.slice(0, 12)
                        : []
                );


                setForecast(
                    Array.isArray(
                        forecastData?.daily
                    )
                        ? forecastData.daily.slice(0, 5)
                        : []
                );


            } catch (initialError) {

                if (cancelled) {
                    return;
                }


                console.error(
                    "Initial weather error:",
                    initialError
                );


                setWeather(null);

                setHourly([]);

                setForecast([]);


                setError(
                    initialError?.message ||
                    "Unable to load weather data."
                );


            } finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }

        };


        initializeWeather();


        return () => {

            cancelled = true;

        };

    }, []);


    // ========================================
    // SEARCH
    // ========================================

    const handleSearch = async (event) => {

        event.preventDefault();


        const city =
            search.trim();


        if (!city || loading) {
            return;
        }


        await loadWeather(city);


        setSearch("");

    };


    // ========================================
    // MY LOCATION
    // ========================================

    const handleLocationWeather =
        async (newWeather) => {

            try {

                setLoading(true);

                setError("");


                await applyWeather(
                    newWeather
                );


            } catch (locationError) {

                console.error(
                    "Location weather error:",
                    locationError
                );


                setError(
                    "Unable to update weather for your location."
                );

            } finally {

                setLoading(false);

            }

        };


    // ========================================
    // WEATHER ICON
    // ========================================

    const getWeatherIcon = (weatherData) => {

        const icon =
            weatherData?.icon;


        switch (icon) {

            case "01d":
                return "☀️";

            case "01n":
                return "🌙";

            case "02d":
                return "🌤️";

            case "02n":
                return "☁️";

            case "03d":
            case "03n":
                return "☁️";

            case "04d":
            case "04n":
                return "☁️";

            case "09d":
            case "09n":
                return "🌧️";

            case "10d":
                return "🌦️";

            case "10n":
                return "🌧️";

            case "11d":
            case "11n":
                return "⛈️";

            case "13d":
            case "13n":
                return "❄️";

            case "50d":
            case "50n":
                return "🌫️";

            default:
                return "🌤️";

        }

    };


    // ========================================
    // TIME
    // ========================================

    const formatTime = (timestamp) => {

        if (!timestamp) {
            return "--:--";
        }


        return new Date(
            timestamp * 1000
        ).toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );

    };


    // ========================================
    // DATE
    // ========================================

    const formatDate = () => {

        return new Date().toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric",
            }
        );

    };


    // ========================================
    // FORECAST DAY
    // ========================================

    const formatForecastDay = (
        timestamp,
        index
    ) => {

        if (index === 0) {
            return "Today";
        }


        if (!timestamp) {
            return "--";
        }


        return new Date(
            timestamp * 1000
        ).toLocaleDateString(
            "en-US",
            {
                weekday: "short",
            }
        );

    };


    // ========================================
    // HOURLY TIME
    // ========================================

    const formatHourlyTime = (
        timestamp,
        index
    ) => {

        if (index === 0) {
            return "Now";
        }


        if (!timestamp) {
            return "--:--";
        }


        return new Date(
            timestamp * 1000
        ).toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );

    };


    return (

        <main className="weather-app">


            {/* ========================================
                BACKGROUND
            ======================================== */}

            <div className="weather-glow weather-glow-one"></div>

            <div className="weather-glow weather-glow-two"></div>


            {/* ========================================
                NAVBAR
            ======================================== */}

            <nav className="weather-navbar">


                <div className="weather-logo">

                    <div className="weather-logo-icon">
                        ☁
                    </div>


                    <div>

                        <span>
                            Adam
                        </span>

                        <strong>
                            Weather
                        </strong>

                    </div>

                </div>


                <div className="navbar-location">

                    <FiMapPin />

                    <span>

                        {weather
                            ? `${weather.name || "Unknown"}${weather.sys?.country
                                ? `, ${weather.sys.country}`
                                : ""
                            }`
                            : DEFAULT_CITY
                        }

                    </span>

                </div>


                <LocationButton
                    onWeatherUpdate={
                        handleLocationWeather
                    }
                />

            </nav>


            {/* ========================================
                MAIN
            ======================================== */}

            <section className="weather-container">


                {/* ========================================
                    HEADER
                ======================================== */}

                <div className="weather-heading">


                    <div>

                        <p className="weather-label">
                            WEATHER DASHBOARD
                        </p>


                        <h1>

                            Weather in{" "}

                            <span>
                                {weather?.name ||
                                    DEFAULT_CITY}
                            </span>

                        </h1>


                        <p className="weather-subtitle">

                            Real-time weather information
                            powered by OpenWeather.

                        </p>

                    </div>


                    {/* SEARCH */}

                    <form
                        className="weather-search"
                        onSubmit={handleSearch}
                    >

                        <FiSearch />


                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search city..."
                            aria-label="Search city"
                        />


                        <button
                            type="submit"
                            disabled={
                                loading ||
                                !search.trim()
                            }
                        >
                            Search
                        </button>

                    </form>

                </div>


                {/* ========================================
                    ERROR
                ======================================== */}

                {error && (

                    <div className="weather-error">

                        {error}

                    </div>

                )}


                {/* ========================================
                    LOADING
                ======================================== */}

                {loading ? (

                    <section className="weather-loading">

                        <div className="loading-spinner"></div>

                        <p>
                            Loading weather...
                        </p>

                    </section>

                ) : weather ? (

                    <>


                        {/* ========================================
                            CURRENT WEATHER
                        ======================================== */}

                        <section className="current-weather-card">


                            <div className="current-weather-main">


                                <div className="current-location">

                                    <FiMapPin />


                                    <div>

                                        <span>
                                            Current weather
                                        </span>


                                        <h2>
                                            {weather.name ||
                                                "Unknown"}
                                        </h2>

                                    </div>

                                </div>


                                <div className="weather-date">

                                    {formatDate()}

                                </div>


                                <div className="temperature-section">


                                    <div className="weather-icon-large">

                                        {getWeatherIcon(
                                            weather.weather?.[0]
                                        )}

                                    </div>


                                    <div className="temperature">

                                        {Math.round(
                                            weather.main?.temp ?? 0
                                        )}

                                        °

                                    </div>


                                    <div className="temperature-info">

                                        <strong>

                                            {weather.weather?.[0]
                                                ?.description
                                                ?.replace(
                                                    /\b\w/g,
                                                    (letter) =>
                                                        letter.toUpperCase()
                                                ) ||
                                                "Unknown"}

                                        </strong>


                                        <span>

                                            Feels like{" "}

                                            {Math.round(
                                                weather.main
                                                    ?.feels_like ?? 0
                                            )}

                                            °

                                        </span>

                                    </div>

                                </div>

                            </div>


                            {/* STATS */}

                            <div className="current-weather-side">


                                <div className="mini-stat">

                                    <span>
                                        HUMIDITY
                                    </span>

                                    <strong>
                                        {weather.main
                                            ?.humidity ?? 0}%
                                    </strong>

                                </div>


                                <div className="mini-stat">

                                    <span>
                                        WIND
                                    </span>

                                    <strong>

                                        {Math.round(
                                            (
                                                weather.wind
                                                    ?.speed ?? 0
                                            ) * 3.6
                                        )}

                                        km/h

                                    </strong>

                                </div>


                                <div className="mini-stat">

                                    <span>
                                        VISIBILITY
                                    </span>

                                    <strong>

                                        {weather.visibility
                                            ? `${(
                                                weather.visibility /
                                                1000
                                            ).toFixed(1)} km`
                                            : "N/A"}

                                    </strong>

                                </div>


                                <div className="mini-stat">

                                    <span>
                                        PRESSURE
                                    </span>

                                    <strong>

                                        {weather.main
                                            ?.pressure ?? 0}

                                        {" "}hPa

                                    </strong>

                                </div>

                            </div>

                        </section>


                        {/* ========================================
                            HOURLY
                        ======================================== */}

                        {hourly.length > 0 && (

                            <section className="hourly-section">


                                <div className="section-header">

                                    <div>

                                        <p>
                                            HOURLY FORECAST
                                        </p>

                                        <h2>
                                            Next 12 hours
                                        </h2>

                                    </div>

                                </div>


                                <div className="hourly-scroll">

                                    {hourly.map(
                                        (hour, index) => (

                                            <div
                                                className={`hourly-card ${index === 0
                                                        ? "active"
                                                        : ""
                                                    }`}
                                                key={
                                                    hour.dt ||
                                                    index
                                                }
                                            >

                                                <span className="hourly-time">

                                                    {formatHourlyTime(
                                                        hour.dt,
                                                        index
                                                    )}

                                                </span>


                                                <div className="hourly-icon">

                                                    {getWeatherIcon(
                                                        hour.weather?.[0]
                                                    )}

                                                </div>


                                                <strong>

                                                    {Math.round(
                                                        Number(
                                                            hour.main
                                                                ?.temp ?? 0
                                                        )
                                                    )}

                                                    °

                                                </strong>


                                                <small>

                                                    {Math.round(
                                                        Number(
                                                            hour.pop ?? 0
                                                        ) * 100
                                                    )}

                                                    % rain

                                                </small>

                                            </div>

                                        )
                                    )}

                                </div>

                            </section>

                        )}


                        {/* ========================================
                            5 DAYS
                        ======================================== */}

                        {forecast.length > 0 && (

                            <section className="forecast-section">


                                <div className="section-header">

                                    <div>

                                        <p>
                                            FORECAST
                                        </p>

                                        <h2>
                                            Next 5 days
                                        </h2>

                                    </div>


                                    <span className="forecast-label">
                                        5 DAYS
                                    </span>

                                </div>


                                <div className="forecast-grid">

                                    {forecast.map(
                                        (day, index) => (

                                            <div
                                                className={`forecast-card ${index === 0
                                                        ? "active"
                                                        : ""
                                                    }`}
                                                key={
                                                    day.dt ||
                                                    index
                                                }
                                            >

                                                <span>

                                                    {formatForecastDay(
                                                        day.dt,
                                                        index
                                                    )}

                                                </span>


                                                <div className="forecast-icon">

                                                    {getWeatherIcon(
                                                        day.weather?.[0]
                                                    )}

                                                </div>


                                                <strong>

                                                    {Math.round(
                                                        Number(
                                                            day.temp
                                                                ?.day ?? 0
                                                        )
                                                    )}

                                                    °

                                                </strong>


                                                <small>

                                                    {day.weather?.[0]
                                                        ?.description
                                                        ?.replace(
                                                            /\b\w/g,
                                                            (letter) =>
                                                                letter.toUpperCase()
                                                        ) ||
                                                        "Unknown"}

                                                </small>


                                                <div className="forecast-range">

                                                    <span>

                                                        {Math.round(
                                                            Number(
                                                                day.temp
                                                                    ?.min ?? 0
                                                            )
                                                        )}

                                                        °

                                                    </span>


                                                    <span>

                                                        {Math.round(
                                                            Number(
                                                                day.temp
                                                                    ?.max ?? 0
                                                            )
                                                        )}

                                                        °

                                                    </span>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            </section>

                        )}


                        {/* ========================================
                            FORECAST UNAVAILABLE
                        ======================================== */}

                        {!forecast.length && (

                            <section className="forecast-section">

                                <div className="section-header">

                                    <div>

                                        <p>
                                            FORECAST
                                        </p>

                                        <h2>
                                            5-day forecast
                                        </h2>

                                    </div>

                                </div>


                                <div className="forecast-unavailable">

                                    <FiSun />

                                    <p>
                                        Forecast is currently unavailable.
                                    </p>

                                    <span>
                                        Current weather data is
                                        working normally.
                                    </span>

                                </div>

                            </section>

                        )}


                        {/* ========================================
                            DETAILS
                        ======================================== */}

                        <section className="details-grid">


                            <div className="detail-card">

                                <span>
                                    <FiSun />
                                </span>


                                <div>

                                    <small>
                                        Sunrise
                                    </small>

                                    <strong>
                                        {formatTime(
                                            weather.sys?.sunrise
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div className="detail-card">

                                <span>
                                    🌇
                                </span>


                                <div>

                                    <small>
                                        Sunset
                                    </small>

                                    <strong>
                                        {formatTime(
                                            weather.sys?.sunset
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div className="detail-card">

                                <span>
                                    <FiDroplet />
                                </span>


                                <div>

                                    <small>
                                        Humidity
                                    </small>

                                    <strong>
                                        {weather.main
                                            ?.humidity ?? 0}%
                                    </strong>

                                </div>

                            </div>


                            <div className="detail-card">

                                <span>
                                    <FiWind />
                                </span>


                                <div>

                                    <small>
                                        Wind speed
                                    </small>

                                    <strong>

                                        {Math.round(
                                            (
                                                weather.wind
                                                    ?.speed ?? 0
                                            ) * 3.6
                                        )}

                                        km/h

                                    </strong>

                                </div>

                            </div>

                        </section>

                    </>

                ) : null}

            </section>


            {/* ========================================
                FOOTER
            ======================================== */}

            <footer className="weather-footer">

                <span>
                    Adam Weather
                </span>

                <span>
                    Real weather data • 2026
                </span>

            </footer>

        </main>

    );

};


export default Home;