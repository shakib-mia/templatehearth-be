const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

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
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    const db = client.db("templatehearth");
    const templatesCollection = db.collection("templates");
    const newslettersCollection = db.collection("newsletters");

    app.get("/templates", async (req, res) => {
      const templates = await templatesCollection.find({}).toArray();
      res.send(templates);
    });

    app.get("/templates/:slug", async (req, res) => {
      try {
        const blog = await templatesCollection.findOne({
          slug: req.params.slug,
        });

        if (!blog) {
          return res.status(404).send({ error: "Blog not found" });
        } else {
          // ✅ manually override or add data
          blog.gettingStartedSteps = [
            {
              step: "Clone the repository",
              description:
                "Use the commands below in your terminal to download the project:",
              commands: [
                "git clone https://github.com/shakib-mia/nexcent.git",
                "cd nexcent",
              ],
            },
            {
              step: "Install dependencies",
              description:
                "Make sure you have Node.js (v14 or higher). Then run:",
              commands: ["npm install"],
            },
            {
              step: "Start the development server",
              description: "Launch the dev server to see the template locally:",
              commands: ["npm run dev"],
              note: "It will open at http://localhost:5173",
            },
            {
              step: "Build for production (optional)",
              description: "To create an optimized production build:",
              commands: ["npm run build"],
              note: "The build output will be in the dist folder.",
            },
          ];

          res.send(blog);
        }
      } catch (error) {
        console.error("Error fetching blog by slug:", error);
        res.status(500).send({ error: "Internal Server Error" });
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
  } catch (err) {
    console.log(err);
  }
}
run().catch(console.dir);

app.listen(port, () => console.log(`listening on port: ${port}`));

// module.exports = app;
