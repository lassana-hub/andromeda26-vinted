const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  console.log("Coucou");
  console.log("req.headers.authorization => ", req.headers.authorization);
  const token = req.headers.authorization.replace("Bearer ", "");
  //   console.log("token => ", token);

  // Si on a pas envoyé de token => 401 Unauthorized
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Unautorized !" });
  }

  // On va chercher en DB si il y a bien un user dont le token correspond à ce qu'on m'a envoyé
  const user = await User.findOne({ token: token }).select("email account");
  // User.findOne({token: ...})
  //   console.log(user._id);
  //   console.log(user.token);
  // Si j'en trouve pas 401 Unauthorized
  if (!user) {
    return res.status(401).json({ message: "Unautorized !" });
  }
  // Si j'en trouve un => C'est ok la personne a le droit d'interroger la route
  if (user) {
    // le req du middleware étant le même objet que le req du controller, je peux passer des infos au controller comme suit
    req.user = user;
    // next permet de passer au middleware suivant
    next();
  }
};

module.exports = isAuthenticated;
