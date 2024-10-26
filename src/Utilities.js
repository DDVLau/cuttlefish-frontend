export function range(length, startAt = 0) {
    return [...Array(length).keys()].map(i => i + startAt);
}

export function getUserInfo() {
  const username = localStorage.getItem("username");
  const api_token = localStorage.getItem("api_token");

  if (!username) {
    return ({ username:"unknown user", api_token:""} ); ;
  }

  return ({ username:username, api_token:api_token});
}