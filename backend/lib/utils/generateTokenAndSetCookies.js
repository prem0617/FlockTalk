import jwt from "jsonwebtoken";

export const generateTokenAndSetCookies = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d", // Token expiration
  });

  console.log(token, "TOKEN");

  res.cookie("flocktalk", token, {
    httpOnly: true,
    secure: true, // ✅ for HTTPS
    sameSite: "None", // ✅ required for cross-site cookies
  });
};
