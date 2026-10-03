import * as Location from "expo-location";

export const getUserLocation = async () => {
  const { status } =
    await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    return null;
  }

  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.BestForNavigation,
  });

  const locationName = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.BestForNavigation,
  });

  console.log("LIVE LOCATION:", loc.coords);


  return {
    lat: loc.coords.latitude,
    lng: loc.coords.longitude,
  };
};