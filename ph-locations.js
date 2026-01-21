// PSGC API helper functions
// Docs: https://psgc.gitlab.io/api/ // gumamit ako nito para sa mga locaiton nito sa adress

window.phLocations = {
  getProvinces: async function () {
    const res = await fetch("https://psgc.gitlab.io/api/provinces/");
    if (!res.ok) throw new Error("Failed to fetch provinces");
    return await res.json();
  },
  getCitiesMunicipalities: async function (provinceCode) {
    // Returns both cities and municipalities for a province
    const res = await fetch(
      `https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities/`,
    );
    if (!res.ok) throw new Error("Failed to fetch cities/municipalities");
    return await res.json();
  },
  getBarangays: async function (cityMunCode) {
    const res = await fetch(
      `https://psgc.gitlab.io/api/cities-municipalities/${cityMunCode}/barangays/`,
    );
    if (!res.ok) throw new Error("Failed to fetch barangays");
    return await res.json();
  },
};
