const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  let token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
  return token;
};

module.exports=generateToken;
