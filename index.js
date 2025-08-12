const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const contact = require("./routes/contact");
const templates = require("./routes/templates");
const { connectDB } = require("./constants");
const nodemailer = require("nodemailer");

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

    app.get("/rest-templates/:slug", async (req, res) => {
      try {
        const slug = req.params.slug;

        const restTemplates = await templatesCollection
          .find({ slug: { $ne: slug } }) // not equal to the given slug
          .toArray();

        res.status(200).send(restTemplates);
      } catch (error) {
        console.error("Error fetching rest blogs:", error);
        res.status(500).send({ error: "Something went wrong!" });
      }
    });

    app.get("/blogs", async (req, res) => {
      let logicalBlogs;
      if (req.headers.route === "/") {
        logicalBlogs = await blogsCollection.find({}).limit(4).toArray();
      } else {
        logicalBlogs = await blogsCollection.find({}).toArray();
      }
      res.send(logicalBlogs);
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
      try {
        const email = req.body.email;

        if (!email) {
          return res.status(400).send({ message: "Email is required" });
        }

        // Check if already exists
        const existingEmail = await newslettersCollection.findOne({
          email: email,
        });
        if (existingEmail) {
          return res
            .status(409)
            .send({ message: "Email is already subscribed" });
        }

        // Insert new email
        const insertResult = await newslettersCollection.insertOne({
          email: email,
          timestamp: Math.floor(Date.now()),
        });

        /** --------------------------
         *  Send Email Notifications
         * -------------------------- */

        // Create transporter
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        // Mail to subscriber
        let subscriberMail = {
          from: `"Template Hearth" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Welcome to Template Hearth Newsletter",
          html: `
        <div style="font-family: Arial, sans-serif; background-color: #f7f7f9; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #7f00e1; color: #ffffff; padding: 16px; font-size: 22px; font-weight: bold; text-align: center;">
              Template Hearth Newsletter
            </div>
            <div style="padding: 24px; color: #171717; font-size: 16px;">
              <p>Hi there!</p>
              <p>Thank you for subscribing to our newsletter. You'll now receive updates, new templates, and exclusive offers straight to your inbox.</p>
              <p>Stay tuned! 🚀</p>
            </div>
            <div style="background-color: #f1f5f9; color: #7f00e1; font-size: 12px; padding: 12px; text-align: center;">
              &copy; ${new Date().getFullYear()} Template Hearth. All rights reserved.
            </div>
          </div>
        </div>
      `,
        };

        // Mail to admin
        let adminMail = {
          from: `"Template Hearth" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_USER, // Admin email
          subject: "📢 New Newsletter Subscriber",
          html: `
    <div style="font-family: Arial, sans-serif; background-color: #f7f7f9; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
        
        <!-- Header -->
        <div style="background-color: #7f00e1; color: #ffffff; padding: 16px 24px; font-size: 20px; font-weight: bold; text-align: center;">
          New Newsletter Subscriber
        </div>

        <!-- Body -->
        <div style="padding: 24px; color: #171717; font-size: 16px; line-height: 1.5;">
          <p>Hi Admin,</p>
          <p>A new user has subscribed to the <strong>Template Hearth Newsletter</strong>.</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #e5d9f2; background-color: #faf7fd;"><strong>Email</strong></td>
              <td style="padding: 8px; border: 1px solid #e5d9f2;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e5d9f2; background-color: #faf7fd;"><strong>Subscription Time</strong></td>
              <td style="padding: 8px; border: 1px solid #e5d9f2;">${new Date().toLocaleString()}</td>
            </tr>
          </table>

          <p style="margin-top: 20px;">Keep up the good work! 🚀</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; color: #7f00e1; font-size: 12px; padding: 12px 24px; text-align: center;">
          &copy; ${new Date().getFullYear()} Template Hearth. Internal Notification.
        </div>

      </div>
    </div>
  `,
        };

        // Send both mails
        await transporter.sendMail(subscriberMail);
        await transporter.sendMail(adminMail);

        res.status(201).send({
          message: "Subscribed successfully and emails sent",
          data: insertResult,
        });
      } catch (error) {
        console.error("Error in /newsletter:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
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

    app.get("/rest-services/:slug", async (req, res) => {
      try {
        const slug = req.params.slug;

        const services = await servicesCollection
          .find({ slug: { $ne: slug } }) // not equal to the given slug
          .toArray();

        res.status(200).send(services);
      } catch (error) {
        console.error("Error fetching rest blogs:", error);
        res.status(500).send({ error: "Something went wrong!" });
      }
    });

    app.post("/contact", async (req, res) => {
      const { name, email, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required" });
      }

      try {
        // Create transporter
        let transporter = nodemailer.createTransport({
          service: "gmail", // Gmail use করছো ধরেই নিচ্ছি
          auth: {
            user: process.env.EMAIL_USER, // তোমার Gmail address
            pass: process.env.EMAIL_PASS, // Gmail app password বা normal password
          },
        });

        // Mail options
        let mailOptions = {
          from: `"Template Hearth" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: `Re: ${subject}`,
          html: `<div style="font-family: Arial, sans-serif; background-color: #f7f7f9; padding: 20px;">
                  <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
                    <div style="background-color: #7f00e1; color: #ffffff; padding: 16px 24px; font-size: 22px; font-weight: bold; text-align: center;">
                      Template Hearth
                    </div>
                    <div style="padding: 24px; color: #171717; font-size: 16px; line-height: 1.5;">
                      <p>Dear <strong>${name}</strong>,</p>
                      <p>Thank you for reaching out to Template Hearth. We have received your message regarding <strong>${subject}</strong>.</p>

                      <p><strong>Your Message:</strong></p>
                      <pre style="background-color: #faf7fd; padding: 12px; border-radius: 4px; white-space: pre-wrap; color: #171717; font-family: inherit; font-size: 15px;">
                      ${message}
                      </pre>

                      <p>Our team is currently reviewing your inquiry and will get back to you as soon as possible—usually within 24-48 hours.</p>
                      <p>If you have any urgent questions, feel free to reply to this email or contact us directly at <a href="mailto:templatehearth@gmail.com">templatehearth@gmail.com</a>.</p>
                      <p>Thank you for choosing Template Hearth. We look forward to assisting you!</p>
                      <hr style="border: none; border-top: 1px solid #e5d9f2; margin: 24px 0;" />
                      <p style="margin-top: 24px;">Best regards,<br />The Template Hearth Team</p>
                    </div>
                    <div style="background-color: #f1f5f9; color: #7f00e1; font-size: 12px; padding: 12px 24px; text-align: center;">
                      &copy; ${new Date().getFullYear()} Template Hearth. All rights reserved.
                    </div>
                  </div>
                </div>`,
        };

        // Send mail
        let info = await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Email sent successfully", info });
      } catch (error) {
        console.error("Error sending email: ", error);
        res.status(500).json({ error: "Failed to send email" });
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
