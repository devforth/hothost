const BASE_LOCAL_URL = "http://localhost:8007/api/v2/";
const BASE_PROD_URL = "/api/v2";

//here should be hostname  

const path = document.location.host === "" ? BASE_PROD_URL : BASE_LOCAL_URL;

async function getData(route) {
  const response = await fetch(`${path}${route}`, {
    method: "GET",

    credentials: "include",
  });

  if (response.status === 401) {
    window.location.assign("http://localhost:5173/login");
  } else {
    const data = await response.json();

    return data;
  }
}

async function addLabel(bodyel, route) {
  const response = await fetch(`${path}${route}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(bodyel),

    credentials: "include",
  });

  const data = await response.json();

  return data;
}

async function deleteHost(body, route) {
  const response = await fetch(`${path}${route}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(body),

    credentials: "include",
  });

  const data = await response.json();

  return data;
}

async function apiFetch(body, route) {
  const response = await fetch(`${path}${route}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(body),

    credentials: "include",
  });

  const data = await response.json();

  return data;
}
export { getData, addLabel, deleteHost, apiFetch };
