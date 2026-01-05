export const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: true, // Always true in production (HTTPS only)
    sameSite: "lax", // Changed from "none" to "lax" for better security
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/", // Ensure cookie is available to all paths
    domain: ".fadsbyphuray.com.ng", // ✅ Allow all subdomains to access this cookie
  });
};

export const clearAuthCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    domain: ".fadsbyphuray.com.ng", // ✅ Match the domain used in setAuthCookie
  });
};