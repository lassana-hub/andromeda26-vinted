// 3 étapes pour Créer une route

// imorter le package express
const express = require("express");

// 2 - Création d'un router
const router = express.Router();
// import de fileupload, package qui permet via un middleware de rendre les formdata lisibles à nos routes
const fileUpload = require("express-fileupload");
// import de cloudinary
const cloudinary = require("cloudinary").v2;
const convertToBase64 = require("../utils/convertToBase64");
const Offer = require("../models/Offer");

// Connexion à mon compte cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // "dmojya53x",
  api_key: process.env.CLOUDINARY_API_KEY, // "375523157487312",
  api_secret: process.env.CLOUDINARY_API_SECRET, // "AWIefrrmPvhkDUGQyXD-PFeXzzk",
});
const isAuthenticated = require("../middlewares/isAuthentificated");
// test
// router.post("/auth", isAuthenticated);
// Les routes
// J'utilise fileUpload pour que ma route puisse lire les formData (seul moyen d'envoyer une image dans un body)
router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      // Les clefs textuelles du formData sont dans req.body
      console.log("body => ", req.body.title);
      // Les clefs fichiers du formData sont dans req.files
      console.log("files => ", req.files);

      // req.user de middleware
      console.log(req.user);

      // Transforme mon image de Buffer à String
      const base64Image = convertToBase64(req.files.picture);

      // Je fais une requête à cloudianry pour qu'il héberge mon image
      const cloudinaryResponse = await cloudinary.uploader.upload(base64Image);

      const { title, description, price, condition, city, brand, size, color } =
        req.body;
      const { picture } = req.files;

      // const salt = uid2(16); // générere une chaîne de caractères aléatoires de 16bit
      // const hash = SHA256(password + salt).toString(encBase64);
      // const token = uid2(64); // générere une chaîne de caractères aléatoires de 64bit

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { MARQUE: brand },
          { TAILLE: size },
          { ÉTAT: condition },
          { COLOR: color },
          { EMPLACEMENT: city },
        ],
        product_image: cloudinaryResponse,
        owner: req.user._id,
      });

      await newOffer.save();
      // pour choisir tel clé dans populate / -clé pour exclure
      await newOffer.populate("owner", "account email");
      res.status(201).json(newOffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Une route Get qui nous permet de récupérer un tableau contenant
// l'ensemble des annonces, ainsi que le nombre total.
router.get("/offers", async (req, res) => {
  const { title, priceMin, priceMax, sort, page } = req.query;

  const filter = {};
  const sortOption = {};

  const pageNumber = Number(page) || 1; // Affichage la première, si le paramètre page n'est pas transmi
  const limit = 3; // 3 annonces par page
  const skip = (pageNumber - 1) * limit;

  if (title) {
    filter.product_name = new RegExp(title, "i");
  }
  if (priceMin || priceMax) {
    filter.product_price = {};
    if (priceMin) {
      filter.product_price.$gte = Number(priceMin);
    }
    if (priceMax) {
      filter.product_price.$lte = Number(priceMax);
    }
  }
  if (sort === "price-asc") {
    sortOption.product_price = 1;
  }
  if (sort === "price-desc") {
    sortOption.product_price = -1;
  }

  const count = await Offer.countDocuments(filter);
  // Math.ceil() arrondit vers le haut, pour
  // n'est pas perdre la dernière pas qui peut etre < à limit
  // const totalPages = Math.ceil(count / limit);
  // // Page inexistante
  // if (pageNumber > totalPages) {
  //   return res.status(404).json({ message: "Page not found !" });
  // }
  const offers = await Offer.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .populate("owner", "account");
  //.select("product_name product_price");

  res.status(200).json({ count: count, offers: offers });
});

// route pour récupérer les détails concernant une annonce, en fonction de son id.
// importer le controller
const offerWithDetailsController = require("../controllers/offer");
router.get("/offers/:id", offerWithDetailsController);
module.exports = router;
