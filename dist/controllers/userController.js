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
exports.GetAllUsers = exports.GetUserById = exports.CreateUser = void 0;
const userService_1 = require("../services/userService");
function CreateUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const model = req.body;
        console.log(req.body);
        const response = yield (0, userService_1.createUser)(model);
        res.status(response.status).json(response);
    });
}
exports.CreateUser = CreateUser;
function GetUserById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const model = req.query;
        const response = yield (0, userService_1.getUserById)(model);
        res.status(response.status).json(response);
    });
}
exports.GetUserById = GetUserById;
function GetAllUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, userService_1.getAllUsers)();
        res.status(response.status).json(response);
    });
}
exports.GetAllUsers = GetAllUsers;
