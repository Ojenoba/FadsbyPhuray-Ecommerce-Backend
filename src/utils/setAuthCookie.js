const isProd = process.env.NODE_ENV === "production";

export const setAuthCookie = (res, token) => {
  res.append(
    "Set-Cookie",
    `token=${token}; Path=/; HttpOnly; Secure; SameSite=None; Partitioned; Max-Age=${7 * 24 * 60 * 60}`
  );
};

export const clearAuthCookie = (res) => {
  res.append(
    "Set-Cookie",
    "token=; Path=/; HttpOnly; Secure; SameSite=None; Partitioned; Max-Age=0"
  );
};