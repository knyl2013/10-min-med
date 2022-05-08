import * as env from "../constants/Environment";
export const login = async (email, password) => {
  // POST request using fetch with async/await
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.API_KEY,
    },
    body: JSON.stringify({ email: email, password: password }),
  };
  const response = await fetch(env.BASE_URL + "/login", requestOptions);
  return await response.json();
};
export const register = async (email, password) => {
  // POST request using fetch with async/await
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.API_KEY,
    },
    body: JSON.stringify({ email: email, password: password }),
  };
  const response = await fetch(env.BASE_URL + "/register", requestOptions);
  return await response.json();
};
