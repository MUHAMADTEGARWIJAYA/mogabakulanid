import Province from "../models/Province.js";
import { getProvinces } from "../config/rajaOngkirService.js";
import City from "../models/City.js";
import { getCitiesByProvince } from "../config/rajaOngkirService.js";
import District from "../models/District.js";
import { getDistrictsByCity } from "../config/rajaOngkirService.js";

export const syncProvinces = async (req, res) => {
  try {
    const provinces = await getProvinces();

    for (const prov of provinces) {
      await Province.findOrCreate({
        where: { province_id: prov.id },
        defaults: {
          name: prov.name,
        },
      });
    }

    res.json({
      message: "Provinsi berhasil disinkronkan",
      total: provinces.length,
    });
  } catch (error) {
    console.error("SYNC PROVINCE ERROR:", error.message);
    res.status(500).json({ msg: error.message });
  }
};

export const syncCities = async (req, res) => {
  try {
    const provinces = await Province.findAll();

    for (const province of provinces) {
      const cities = await getCitiesByProvince(province.id);

      for (const city of cities) {
        await City.findOrCreate({
          where: { id: city.id },
          defaults: {
            name: city.name,
            province_id: province.id,
            zip_code: city.zip_code ?? null,
          },
        });
      }
    }

    res.json({
      message: "City berhasil disinkronkan",
      total: cities.length,
    });
  } catch (error) {
    console.error("SYNC CITY ERROR:", error);
    res.status(500).json({ msg: error.message });
  }
};

export const syncDistrictsByCity = async (req, res) => {
  try {
    const { city_id } = req.params;

    const districts = await getDistrictsByCity(city_id);

    for (const dist of districts) {
      await District.findOrCreate({
        where: { district_id: dist.id },
        defaults: {
          district_id: dist.id,
          city_id: city_id,
          name: dist.name,
          zip_code: dist.zip_code,
        },
      });
    }

    res.json({
      message: "District berhasil disinkronkan",
      city_id,
      total: districts.length,
    });
  } catch (error) {
    console.error("SYNC DISTRICT ERROR:", error.message);
    res.status(500).json({ msg: error.message });
  }
};
