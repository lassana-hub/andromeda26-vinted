// importer les models
const Offer = require("../models/Offer");

const offerWithDetailsController = async (req, res) => {
  try {
    const { id } = req.params;
    const offerWithDetails = await Offer.findById(id).populate(
      "owner",
      "account",
    );
    res.status(200).json({ product_details: offerWithDetails });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = offerWithDetailsController;
