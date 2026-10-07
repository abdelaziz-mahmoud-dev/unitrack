const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const universityRoutes = require("./routes/university.routes");
const applicationRoutes = require("./routes/application.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const swaggerUi = require("swagger-ui-express");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "unitrack" });
});

const openapi = YAML.parse(
  fs.readFileSync(path.join(__dirname, "../docs/openapi.yaml"), "utf8")
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapi));

app.use("/api/auth", authRoutes);
app.use("/api/universities", universityRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;