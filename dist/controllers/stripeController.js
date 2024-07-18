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
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceDetails = exports.userPaymentSessions = exports.StripeWebhook = exports.StripePaymentSession = void 0;
const stripeService_1 = require("../services/stripeService");
function StripePaymentSession(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const model = req.body;
        const response = yield (0, stripeService_1.checkoutPaymentSession)(req, model);
        res.status(response.status).json(response);
    });
}
exports.StripePaymentSession = StripePaymentSession;
function StripeWebhook(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, stripeService_1.stripeWebhook)(req, res);
        res.status(response.status).json(response);
    });
}
exports.StripeWebhook = StripeWebhook;
function userPaymentSessions(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const model = req.body;
        const response = yield (0, stripeService_1.userPaymentSession)(model);
        res.status(response.status).json(response);
    });
}
exports.userPaymentSessions = userPaymentSessions;
function invoiceDetails(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const model = req.body;
        const response = yield (0, stripeService_1.invoiceDetail)(model);
        res.status(response.status).json(response);
    });
}
exports.invoiceDetails = invoiceDetails;
