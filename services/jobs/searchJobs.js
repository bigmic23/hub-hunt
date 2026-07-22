async function searchJobs(query) {
  return [
    {
      id: 1,
      title: "Registered Nurse",
      company: "Charité Hospital",
      location: "Berlin, Germany",
      salary: "€3,800/month"
    },
    {
      id: 2,
      title: "ICU Nurse",
      company: "Vivantes",
      location: "Berlin, Germany",
      salary: "€4,200/month"
    }
  ];
}

module.exports = {
  searchJobs
};
