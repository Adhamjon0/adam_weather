const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

const BASE_URL =
    "https://api.openweathermap.org/data/2.5";


// ========================================
// API REQUEST HELPER
// ========================================

async function request(endpoint) {

    if (!API_KEY) {

        throw new Error(
            "OpenWeather API key is missing."
        );

    }


    const controller =
        new AbortController();

    const timeout =
        setTimeout(() => {
            controller.abort();
        }, 15000);


    try {

        const response = await fetch(
            `${BASE_URL}${endpoint}`,
            {
                signal: controller.signal,
            }
        );


        const data =
            await response.json().catch(() => null);


        if (!response.ok) {

            const message =
                data?.message ||
                "Weather data unavailable.";

            throw new Error(message);

        }


        return data;

    } catch (error) {

        if (error.name === "AbortError") {

            throw new Error(
                "Weather request timed out. Please try again."
            );

        }


        throw error;

    } finally {

        clearTimeout(timeout);

    }

}


// ========================================
// CURRENT WEATHER BY CITY
// ========================================

export async function getCurrentWeather(city) {

    if (!city?.trim()) {

        throw new Error(
            "Please enter a city name."
        );

    }


    return await request(
        `/weather?q=${encodeURIComponent(city.trim())}&appid=${API_KEY}&units=metric`
    );

}


// ========================================
// CURRENT WEATHER BY LOCATION
// ========================================

export async function getCurrentWeatherByCoordinates(
    latitude,
    longitude
) {

    if (
        !Number.isFinite(Number(latitude)) ||
        !Number.isFinite(Number(longitude))
    ) {

        throw new Error(
            "Invalid location coordinates."
        );

    }


    return await request(
        `/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );

}


// ========================================
// FORECAST
// OPENWEATHER 5 DAYS / 3 HOURS
// ========================================

export async function getForecast(
    latitude,
    longitude
) {

    if (
        !Number.isFinite(Number(latitude)) ||
        !Number.isFinite(Number(longitude))
    ) {

        throw new Error(
            "Invalid forecast coordinates."
        );

    }


    const data = await request(
        `/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );


    // ========================================
    // REAL 3-HOUR FORECAST
    // ========================================

    const hourly =
        Array.isArray(data?.list)
            ? data.list.slice(0, 12)
            : [];


    // ========================================
    // GROUP FORECAST BY DAY
    // ========================================

    const days = {};


    if (Array.isArray(data?.list)) {

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

    const daily =
        Object.keys(days)
            .slice(0, 5)
            .map((dayKey) => {

                const items =
                    days[dayKey];


                if (!items.length) {
                    return null;
                }


                // --------------------------------
                // TEMPERATURES
                // --------------------------------

                const temperatures =
                    items
                        .map((item) =>
                            Number(
                                item?.main?.temp
                            )
                        )
                        .filter((temperature) =>
                            Number.isFinite(
                                temperature
                            )
                        );


                // --------------------------------
                // MIDDLE FORECAST
                // --------------------------------

                const middleIndex =
                    Math.floor(
                        items.length / 2
                    );


                const middle =
                    items[middleIndex] ||
                    items[0];


                return {

                    date: dayKey,

                    dt: middle?.dt ?? null,

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