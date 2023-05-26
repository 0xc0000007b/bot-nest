import axios from "axios";

export const calcTime = async (address: string) => {
  const origin: string = 'Новотушинская 5';
  const baseUrl: string = 'https://nominatim.openstreetmap.org';
  const mode: string = 'driving';

  const timeToWait: number = 10;
  const originResponse = await axios.get(
    `${baseUrl}/search?format=json&q=${origin}`
  );
  const originLatLong = {
    lat: originResponse.data[0].lat,
    lng: originResponse.data[0].lon,
  };

  const moscowCoords = { lat: 55.7558, lng: 37.6173 };
  const boundRadius = 50000;
  const viewboxCoords = {
    minLat: moscowCoords.lat - boundRadius / 111300,
    maxLat: moscowCoords.lat + boundRadius / 111300,
    minLng:
      moscowCoords.lng - boundRadius / (111300 * Math.cos(moscowCoords.lat)),
    maxLng:
      moscowCoords.lng + boundRadius / (111300 * Math.cos(moscowCoords.lat)),
  };

  const destinationResponse = await axios.get(
    `${baseUrl}/search?format=json&street=${address?.toLowerCase()}&countrycodes=RUS&viewbox=${
      viewboxCoords.minLng
    },${viewboxCoords.minLat},${viewboxCoords.maxLng},${
      viewboxCoords.maxLat
    }&bounded=1`
  );
  if (!destinationResponse.data.length) {
    throw new Error('Неверный адрес доставки');
  }
  const destinationLatLng = {
    lat: destinationResponse.data[0].lat,
    lng: destinationResponse.data[0].lon,
  };
  const routeResponse = await axios.get(
    `https://router.project-osrm.org/route/v1/${mode}/${originLatLong.lng},${originLatLong.lat};${destinationLatLng.lng},${destinationLatLng.lat}?overview=false`
  );
  const routeDurationSeconds = routeResponse.data.routes[0].duration;
  const fixedTimeMinutes = 15;
  const deliveryTimePerPizzaMinutes = 15;
  const returnTimeMinutes = 15;
  const waitingTimeBetweenOrdersMinutes = timeToWait;
  const totalTimeSeconds =
    fixedTimeMinutes +
    (2 * deliveryTimePerPizzaMinutes + 2 * returnTimeMinutes) +
    waitingTimeBetweenOrdersMinutes +
    routeDurationSeconds;
  const hours = Math.floor(totalTimeSeconds / 3600);
  const minutes = Math.floor((totalTimeSeconds % 3600) / 60);
  const seconds = Math.floor(totalTimeSeconds % 60);
  const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return formattedDuration;
};
