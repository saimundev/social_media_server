import jwt from "jsonwebtoken";

const genAuthToken = (user) => {
  const token = jwt.sign(
    {
      name: user.name,
      email: user.email,
      userId: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "12d" }
  );

  return token;
};

export default genAuthToken;
