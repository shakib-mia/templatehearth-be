const { getTemplatesCollection } = require("../constants");
// import getTemplatesCollection from "../constants";

const router = require("express").Router();
// console.log(templatesCollection);

router.get("/", async (req, res) => {
  const templatesCollection = await getTemplatesCollection("templates");
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

router.get("/:slug", async (req, res) => {
  const templatesCollection = await getTemplatesCollection("templates");

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
          description: "Make sure you have Node.js (v14 or higher). Then run:",
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

module.exports = router;
