const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

const BASE_URL =
    "https://api.openweathermap.org/data/2.5";


// ========================================
// CURRENT WEATHER BY CITY
// ========================================

export async function getCurrentWeather(city) {

    const response = await fetch(
        `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );


    if (!response.ok) {

        throw new Error(
            "City weather data unavailable"
        );

    }


    return await response.json();

}


// ========================================
// CURRENT WEATHER BY LOCATION
// ========================================

export async function getCurrentWeatherByCoordinates(
    latitude,
    longitude
) {

    const response = await fetch(
        `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );


    if (!response.ok) {

        throw new Error(
            "Weather data unavailable"
        );

    }


    return await response.json();

}


// ========================================
// FORECAST
// OPENWEATHER 5 DAYS / 3 HOURS
// ========================================

export async function getForecast(
    latitude,
    longitude
) {

    const response = await fetch(
        `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );


    if (!response.ok) {

        throw new Error(
            "Forecast data unavailable"
        );

    }


    const data =
        await response.json();


    // ========================================
    // REAL 3-HOUR FORECAST
    // ========================================

    const hourly =
        Array.isArray(data.list)
            ? data.list.slice(0, 12)
            : [];


    // ========================================
    // GROUP FORECAST BY DAY
    // ========================================

    const days = {};


    if (Array.isArray(data.list)) {

        data.list.forEach((item) => {

            if (!item?.dt_txt) {
                return;
            }


            const dayKey =
                item.dt_txt.split(" ")[0];


            if (!days[dayKey]) {

                days[dayKey] = [];

            }


            days[dayKey].push(item);

        });

    }


    // ========================================
    // CREATE DAILY FORECAST
    // ========================================

    const daily = Object.keys(days)
        .slice(0, 5)
        .map((dayKey) => {

            const items =
                days[dayKey];


            if (!items.length) {
                return null;
            }


            // Temperatures for this day

            const temperatures =
                items
                    .map(
                        (item) =>
                            Number(
                                item?.main?.temp
                            )
                    )
                    .filter(
                        (temperature) =>
                            Number.isFinite(
                                temperature
                            )
                    );


            // Middle forecast item

            const middleIndex =
                Math.floor(
                    items.length / 2
                );


            const middle =
                items[middleIndex] ||
                items[0];


            return {

                dt: middle.dt,

                temp: {

                    day:
                        Number(
                            middle?.main?.temp ?? 0
                        ),

                    min:
                        temperatures.length
                            ? Math.min(
                                ...temperatures
                            )
                            : 0,

                    max:
                        temperatures.length
                            ? Math.max(
                                ...temperatures
                            )
                            : 0,

                },

                weather:
                    middle?.weather || [],

            };

        })
        .filter(Boolean);


    // ========================================
    // RETURN DATA
    // ========================================

    return {

        hourly,

        daily,

    };

}