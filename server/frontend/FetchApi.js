async function getData() {
  const BASE_LOCAL_URL = "http://localhost:8007/api/v2/getMonitoringData";
  const BASE_PROD_URL = "/api/";
  const path = document.location.host === "" ? BASE_PROD_URL : BASE_LOCAL_URL;
  const response = await fetch(path, {
    method: "GET",

    credentials: "include",
  });

  const data = await response.json();

  return data;
}

export { getData };
