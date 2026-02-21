// importer le package express pour créer le serveur
const express = require("express");
// importer le package mongoose pour créer et manipuler la BDD
const mongoose = require("mongoose");

// créer un serveur express qui s'appelle app
const app = express();
app.use(express.json()); // pour lire de body des requêtes

// importer la package "dotenv"
// qui permet d'activer les variables d'environnement qui se trouvent dans le fichier `.env`
require("dotenv").config(); //

// Création d'une connection à la base de données
mongoose.connect(process.env.MONGODB_URI); // "mongodb://localhost/vinted"

// importer les routers Singup, login, offer
const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");

// Utilisation de routes importés
app.use("/user", userRoutes);
app.use("/", offerRoutes);

// créer Catch-all route : qui intercepte toiutes les requêtes
// qui ne correespondent à aucune route définie plus haut
app.all(/.*/, (req, res) => {
  res.status(404).json({
    message: "This route does not exist",
  });
});

// Démmarage du serveur au port 3000
app.listen(process.env.PORT, () => {
  console.log("Serveur satrted 🚀");
});
