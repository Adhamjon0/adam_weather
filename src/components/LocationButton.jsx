import { useState } from "react";
import { FiNavigation } from "react-icons/fi";

import { getCurrentWeatherByCoordinates } from "../services/weatherApi";

import "./LocationButton.css";


const LocationButton = ({ onWeatherUpdate }) => {

    const [loading, setLoading] = useState(false);


    const handleLocation = () => {

        if (!navigator.geolocation) {

            alert(
                "Geolocation is not supported by your browser."
            );

            return;
        }


        if (loading) return;


        setLoading(true);


        navigator.geolocation.getCurrentPosition(

            async (position) => {

                const {
                    latitude,
                    longitude
                } = position.coords;


                try {

                    const weather =
                        await getCurrentWeatherByCoordinates(
                            latitude,
                            longitude
                        );


                    if (!weather) {
                        throw new Error(
                            "Weather data was not found."
                        );
                    }


                    onWeatherUpdate(weather);

                } catch (error) {

                    console.error(
                        "Weather location error:",
                        error
                    );


                    alert(
                        "We couldn't get the weather for your current location."
                    );

                } finally {

                    setLoading(false);

                }

            },

            (error) => {

                console.error(
                    "Geolocation error:",
                    error
                );


                if (
                    error.code ===
                    error.PERMISSION_DENIED
                ) {

                    alert(
                        "Location access was denied. Please allow location permission in your browser."
                    );

                } else if (
                    error.code ===
                    error.POSITION_UNAVAILABLE
                ) {

                    alert(
                        "Your current location is unavailable. Please try again."
                    );

                } else if (
                    error.code ===
                    error.TIMEOUT
                ) {

                    alert(
                        "Location detection timed out. Please try again."
                    );

                } else {

                    alert(
                        "Unable to detect your location."
                    );

                }


                setLoading(false);

            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 300000
            }

        );

    };


    return (

        <button
            className={`location-button ${loading
                    ? "location-button--loading"
                    : ""
                }`}
            onClick={handleLocation}
            disabled={loading}
            type="button"
            aria-label="My Location"
        >

            {/* DESKTOP ICON */}

            <FiNavigation
                className={`location-desktop-icon ${loading
                        ? "location-icon--loading"
                        : ""
                    }`}
            />


            {/* DESKTOP TEXT */}

            <span className="location-button-text">

                {loading
                    ? "Detecting location..."
                    : "My Location"
                }

            </span>


            {/* MOBILE ICON */}

            <FiNavigation
                className={`location-mobile-icon ${loading
                        ? "location-icon--loading"
                        : ""
                    }`}
            />

        </button>

    );

};


export default LocationButton;