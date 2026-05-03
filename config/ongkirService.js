import { calculateDistanceKm } from "./distance.js";
import getDistrictFromCoords from "./reverseGeocode.js";

export const hitungOngkirFood = async ({ umkm, latitude, longitude }) => {
  if (
    latitude === undefined ||
    longitude === undefined ||
    latitude === null ||
    longitude === null
  ) {
    throw new Error("Koordinat tidak valid");
  }
  const district = await getDistrictFromCoords(latitude, longitude);

  if (!district || !district.toLowerCase().includes("moga")) {
    throw new Error("Pesanan food hanya tersedia di Kecamatan Moga");
  }

  const distance = calculateDistanceKm(
    Number(umkm.latitude),
    Number(umkm.longitude),
    Number(latitude),
    Number(longitude),
  );

  return {
    ongkir: distance <= 3 ? 5000 : 10000,
    distance,
    district,
  };
};
