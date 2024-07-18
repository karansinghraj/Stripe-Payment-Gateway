import express from "express";
import dotenv from "dotenv";
import { connectToMongoDB } from "./config/dbConfig";
import { stripeRoute } from "./routes/stripeRoute";
import { userRoute } from "./routes/userRoute";
import { scheduleDailySubscriptionReminders } from "./utilis/paymentReminder";
import path from "path";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./middleware/errorHandler";
dotenv.config();

const app = express();
const port = 5300;

const swaggerOptions = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Transaction Section",
      version: "0.0.1",
      description: "Payment section ",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.ts"],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/api/stripe", stripeRoute);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/user", userRoute);
app.use("/api/stripe/pay", stripeRoute);

scheduleDailySubscriptionReminders();
app.use(errorHandler);

app.listen(port, async () => {
  await connectToMongoDB();
  console.log(`server started on port : ${port}`);
});
