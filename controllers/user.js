// importer les models
const User = require("../models/User");

// importer les outils de hashage
const uid2 = require("uid2"); // générer une aîne de caractères aléatoires
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const signupController = async (req, res) => {
  try {
    const { email, username, password, newsletter } = req.body;
    // Si le username, password, email n'est pas renseigné
    if (!username || !password || !email) {
      return res.status(400).json({ message: "username required !" });
    }
    // Si l'email renseignée existe déjà dans la base de données
    const isExitsEmail = await User.findOne({ email: email });
    if (isExitsEmail) {
      return res.status(401).json({ message: "Unauthorized !" });
    }
    const salt = uid2(16); // générere une chaîne de caractères aléatoires de 16bit
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(64); // générere une chaîne de caractères aléatoires de 64bit

    const newUser = new User({
      email: email,
      account: {
        username: username,
        avatar: {
          default: 0,
        },
      },
      newsletter: newsletter,
      token: token,
      hash: hash,
      salt: salt,
    });

    await newUser.save();

    res.status(201).json({
      _id: newUser._id,
      token: newUser.token,
      account: newUser.account,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Si l'mail ou password n'est pas renseigné
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email or password is required !" });
    }
    // Si l'email renseignée n'existe pas dans la base de données
    const isExitsEmail = await User.findOne({ email: email });
    if (!isExitsEmail) {
      return res.status(401).json({ message: "Unauthorized !" });
    }

    // Si l'email exist dans la BDD ===>
    const newHhash = SHA256(password + isExitsEmail.salt).toString(encBase64);

    if (newHhash !== isExitsEmail.hash) {
      return res.status(401).json({ message: "Unauthorized h !" });
    } else {
      res.status(200).json({
        _id: isExitsEmail._id,
        token: isExitsEmail.token,
        account: isExitsEmail.account,
      });
    }
  } catch (error) {
    message: res.status(500).json({ message: error.message });
  }
};

module.exports = { loginController, signupController };
