import axios from "axios";

export const getDistrictFromCoords = async (lat, lon) => {
  console.log("🔎 [REVERSE] Request lat/lon:", lat, lon);

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "UMKM-Food-App/1.0 (contact: tegar@email.com)",
      },
      timeout: 7000,
    });

    console.log("📦 [REVERSE] Full response:", JSON.stringify(data, null, 2));

    const district =
      data.address?.subdistrict ||
      data.address?.city_district ||
      data.address?.county ||
      null;

    console.log("📍 [REVERSE] Parsed district:", district);

    return district;
  } catch (err) {
    console.error("❌ [REVERSE] Error:", err.message);
    return null;
  }
};
export default getDistrictFromCoords;
