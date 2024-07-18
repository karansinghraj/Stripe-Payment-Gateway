"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const dbConfig_1 = require("./config/dbConfig");
const stripeRoute_1 = require("./routes/stripeRoute");
const userRoute_1 = require("./routes/userRoute");
const paymentReminder_1 = require("./utilis/paymentReminder");
const path_1 = __importDefault(require("path"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
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
const specs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
app.use("/api/stripe", stripeRoute_1.stripeRoute);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.use("/api/user", userRoute_1.userRoute);
app.use("/api/stripe/pay", stripeRoute_1.stripeRoute);
(0, paymentReminder_1.scheduleDailySubscriptionReminders)();
app.use(errorHandler_1.errorHandler);
app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, dbConfig_1.connectToMongoDB)();
    console.log(`server started on port : ${port}`);
}));
