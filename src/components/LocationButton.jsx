import { useState } from "react";
import { FiNavigation } from "react-icons/fi";

import { getCurrentWeatherByCoordinates } from "../services/weatherApi";


const LocationButton = ({ onWeatherUpdate }) => {

    const [loading, setLoading] = useState(false);


    const handleLocation = () => {

        if (!navigator.geolocation) {

            alert(
                "Your browser does not support location."
            );

            return;
        }


        setLoading(true);


        navigator.geolocation.getCurrentPosition(

            async (position) => {

                try {

                    const {
                        latitude,
                        longitude
                    } = position.coords;


                    const weather =
                        await getCurrentWeatherByCoordinates(
                            latitude,
                            longitude
                        );


                    onWeatherUpdate(weather);

                } catch (error) {

                    console.error(error);

                    alert(
                        "Unable to get weather for your location."
                    );

                } finally {

                    setLoading(false);

                }

            },

            (error) => {

                console.error(error);

                if (error.code === 1) {

                    alert(
                        "Location permission was denied. Please allow location access."
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
                timeout: 10000,
                maximumAge: 0
            }

        );

    };


    return (

        <button
            className="location-button"
            onClick={handleLocation}
            disabled={loading}
            type="button"
        >

            <FiNavigation />

            <span>

                {loading
                    ? "Detecting..."
                    : "My Location"
                }

            </span>

        </button>

    );

};


export default LocationButton;