const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const contact = require("./routes/contact");
const templates = require("./routes/templates");
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
    const templatesCollection = db.collection("templates");
    const newslettersCollection = db.collection("newsletters");
    const blogsCollection = db.collection("blogs");
    const servicesCollection = db.collection("services");

    app.get("/templates", async (req, res) => {
      const templates = await templatesCollection
        .find(
          {},
          {
            projection: { image: 1, headline: 1, shortDescription: 1, slug: 1 },
          }
        )
        .toArray();

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

          blog.whyChoose = [
            {
              heading: "Lightweight & Fast",
              text: "Built with Vite.js for blazing fast development and optimized builds.",
            },
            {
              heading: "Smooth UX",
              text: "Includes buttery-smooth scrolling and elegant animation effects.",
            },
            {
              heading: "Responsive Design",
              text: "Looks perfect on all devices — desktop, tablet, and mobile.",
            },
            {
              heading: "Easy to Customize",
              text: "Uses Tailwind CSS with semantic utility classes and custom config for colors, fonts, and layout.",
            },
            {
              heading: "SEO Friendly",
              text: "Semantic HTML, proper heading structure, meta tags, and fast load times for better search rankings.",
            },
            {
              heading: "Minimal JavaScript",
              text: "Only essential scripts to keep your site fast and smooth.",
            },
          ];

          blog.customization = {
            intro:
              "Nexcent uses Tailwind CSS with a custom configuration for colors, fonts, and layout.",
            highlights: [
              "Container is centered with responsive max-widths: sm (100%), md (768px), lg (1000px), xl (1200px).",
              "Custom neutral and primary color palette.",
              "Semantic font sizes: headline-1, body-1, etc.",
            ],
            configFile: "tailwind.config.js",
          };
          blog.usefulLink = [
            { label: "Vite Documentation", url: "https://vitejs.dev/" },
            { label: "Node.js Download", url: "https://nodejs.org/" },
            {
              label: "GitHub – How to clone a repo",
              url: "https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository",
            },
          ];
          blog.needHelp =
            "If you have any questions or need support customizing this template, feel free to contact me. Thank you for your interest and happy coding! 🚀";
          console.log(blog);
          res.send(blog);
        }
      } catch (error) {
        console.error("Error fetching blog by slug:", error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    app.get("/blogs", async (req, res) => {
      const blogs = await blogsCollection
        .find(
          {},
          {
            projection: { image: 1, headline: 1, shortDescription: 1, slug: 1 },
          }
        )
        .toArray();
      res.send(blogs);
    });

    app.get("/blogs/:slug", async (req, res) => {
      try {
        const blog = await blogsCollection.findOne({
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

    app.get("/services", async (req, res) => {
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

    app.get("/services/:slug", async (req, res) => {
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

    app.get("/blogs", async (req, res) => {
      let blogs;
      if (req.headers.route === "/") {
        blogs = await blogsCollection.find({}).limit(4).toArray();
      } else {
        blogs = await blogsCollection.find({}).toArray();
      }
      res.send(blogs);
    });

    app.get("/blogs/:slug", async (req, res) => {
      const { slug } = req.params;
      const blog = await blogsCollection.findOne({ slug });
      res.send(blog);
    });

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

    app.get("/services", async (req, res) => {
      let services;
      if (req.headers.route === "/") {
        services = await servicesCollection.find({}).limit(6).toArray();
      } else {
        services = await servicesCollection.find({}).toArray();
      }
      res.send(services);
    });

    app.get("/services/:slug", async (req, res) => {
      const { slug } = req.params;

      const service = await servicesCollection.findOne({ slug });
      res.send(service);
    });

    // app.post("/giveaway/:slug", async (req, res) => {});
  } catch (err) {
    console.log(err);
  }
}
run().catch(console.dir);

app.listen(port, () => console.log(`http://localhost:${port}`));

// module.exports = app;
