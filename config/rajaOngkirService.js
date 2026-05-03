import axios from "axios";

const BASE_URL = "https://rajaongkir.komerce.id/api/v1";
const headers = {
  key: process.env.RAJAONGKIR_API_KEY,
  accept: "application/json",
};

export const getProvinces = async () => {
  const res = await axios.get(`${BASE_URL}/destination/province`, { headers });
  return res.data.data;
};

export const getCitiesByProvince = async (provinceId) => {
  const res = await axios.get(`${BASE_URL}/destination/city`, {
    headers,
    params: { province_id: provinceId },
  });
  return res.data.data;
};

export const getDistrictsByCity = async (cityId) => {
  const res = await axios.get(`${BASE_URL}/destination/district`, {
    headers,
    params: { city_id: cityId },
  });
  return res.data.data;
};
