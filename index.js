const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const contact = require("./routes/contact");
const templates = require("./routes/templates");
const blogs = require("./routes/blogs");
const services = require("./routes/services");
const { connectDB } = require("./constants");

require("dotenv").config();
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.hdemiyo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

const port = process.env.PORT || 5000;

app.get("/", async (req, res) => {
  res.send(`from port: ${port}`);
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    const db = client.db("templatehearth");
    const newslettersCollection = db.collection("newsletters");
    const blogsCollection = db.collection("blogs");

    const routes = [
      {
        path: "/contact",
        element: contact,
      },
      {
        path: "/templates",
        element: templates,
      },
      {
        path: "/blogs",
        element: blogs,
      },
      {
        path: "/services",
        element: services,
      },
    ];

    routes.map(({ path, element }) => app.use(path, element));

    app.get("/rest-blogs/:slug", async (req, res) => {
      try {
        const slug = req.params.slug;

        const restBlogs = await blogsCollection
          .find({ slug: { $ne: slug } }) // not equal to the given slug
          .toArray();

        res.status(200).send(restBlogs);
      } catch (error) {
        console.error("Error fetching rest blogs:", error);
        res.status(500).send({ error: "Something went wrong!" });
      }
    });

    app.post("/newsletter", async (req, res) => {
      // console.log();
      const insertCursor = await newslettersCollection.insertOne({
        email: req.body.email,
        timestamp: Math.floor(Date.now()),
      });

      res.send(insertCursor);
    });

    app.get("/newsletter", async (req, res) => {
      try {
        const newsletters = await newslettersCollection.find({}).toArray();
        res.send(newsletters);
      } catch (error) {
        console.error("Error fetching newsletters:", error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    // app.post("/giveaway/:slug", async (req, res) => {});
  } catch (err) {
    console.log(err);
  }
}
run().catch(console.dir);

app.listen(port, () => console.log(`http://localhost:${port}`));

// module.exports = app;
