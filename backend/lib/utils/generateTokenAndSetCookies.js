import jwt from "jsonwebtoken";

export const generateTokenAndSetCookies = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d", // Token expiration
  });

  console.log(token, "TOKEN");

  res.cookie("flocktalk", token, {
    httpOnly: true,
    secure: false, // Change to true in production with HTTPS
    sameSite: "lax", // Adjust if needed
  });
};
