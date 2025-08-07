// import getTemplatesCollection from "../constants";
const { getTemplatesCollection } = require("../constants.js");

const router = require("express").Router();

router.get("/", async (req, res) => {
  const blogsCollection = await getTemplatesCollection("blogs");
  const templates = await blogsCollection
    .find(
      {},
      {
        projection: { image: 1, headline: 1, shortDescription: 1, slug: 1 },
      }
    )
    .toArray();
  res.send(templates);
});

router.get("/:slug", async (req, res) => {
  const templatesCollection = await getTemplatesCollection("blogs");

  try {
    const blog = await templatesCollection.findOne({
      slug: req.params.slug,
    });

    if (!blog) {
      return res.status(404).send({ error: "Blog not found" });
    }
    res.send(blog);
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = router;
