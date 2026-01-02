const isProd = process.env.NODE_ENV === "production";

export const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "none",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Append Partitioned attribute
  res.append(
    "Set-Cookie",
    `token=${token}; Path=/; HttpOnly; Secure; SameSite=None; Partitioned; Max-Age=${7 * 24 * 60 * 60}`
  );
};

export const clearAuthCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: "none",
    path: "/",
  });

  res.append(
    "Set-Cookie",
    "token=; Path=/; HttpOnly; Secure; SameSite=None; Partitioned; Max-Age=0"
  );
};