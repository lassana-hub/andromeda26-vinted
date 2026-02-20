// trois étapes pour créer une route

// 1- importer le package express
const express = require("express");

// 2- Création d'un router
const router = express.Router();



// importer les controlleurs
const { loginController, signupController } = require("../controllers/user");

// Route POST pour l’inscription d’un utilisateur
router.post("/signup", signupController);

// Route POST pour login d’un utilisateur
router.post("/login", loginController);

// 3- exporter du router
module.exports = router;
