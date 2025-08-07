// import getTemplatesCollection from "../constants";
const { getTemplatesCollection } = require("../constants.js");

const router = require("express").Router();

router.get("/", async (req, res) => {
  const servicesCollection = await getTemplatesCollection("services");
  const services = await servicesCollection
    .find(
      {},
      {
        projection: { image: 1, headline: 1, shortDescription: 1, slug: 1 },
      }
    )
    .toArray();

  console.log(services);
  res.send(services);
});

router.get("/:slug", async (req, res) => {
  const servicesCollection = await getTemplatesCollection("services");

  try {
    const service = await servicesCollection.findOne({
      slug: req.params.slug,
    });

    if (!service) {
      return res.status(404).send({ error: "Service not found" });
    }
    res.send(service);
  } catch (error) {
    console.error("Error fetching service by slug:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = router;
