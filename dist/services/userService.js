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
exports.getUserById = exports.getAllUsers = exports.createUser = void 0;
const user_1 = require("../schema/user"); // Import the User schema
const errorHandler_1 = require("../middleware/errorHandler");
function createUser(model) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { username, email, password } = model;
            console.log(model);
            // Create a new user instance
            const newUser = new user_1.User({
                username: username,
                email: email,
                password: password,
            });
            // Save the user to the database
            const savedUser = yield newUser.save();
            console.log("User created:", savedUser);
            return {
                status: 200,
                message: "User Created Successfully",
                data: null,
            }; // Send the saved user object as a response
        }
        catch (error) {
            console.error("Error fetching user:", error);
            throw new errorHandler_1.CustomError(error.statusCode || 500, error.message || "An error occurred while fetching the user");
            // return {
            //   status: 500,
            //   message: "Internal server error",
            //   data: null,
            // }; // Send an error response
        }
    });
}
exports.createUser = createUser;
function getUserById(model) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId } = model; // Extract userId from request parameters
            console.log(userId);
            // Find the user by ID in the database
            const user = yield user_1.User.findOne({ _id: userId });
            // If user is found, send it as a response
            if (user) {
                return {
                    status: 200,
                    message: "Success",
                    data: user,
                };
            }
            else {
                return {
                    status: 200,
                    message: "User not found",
                    data: null,
                };
            }
        }
        catch (error) {
            console.error("Error fetching user:", error);
            throw new errorHandler_1.CustomError(error.statusCode || 500, error.message || "An error occurred while fetching the user");
            // return {
            //   status: 500,
            //   message: "Internal server error",
            //   data: null,
            // };
        }
    });
}
exports.getUserById = getUserById;
function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Find all users in the database
            const users = yield user_1.User.find();
            // Send the list of users as a response
            return {
                status: 200,
                message: "Success",
                data: users,
            };
        }
        catch (error) {
            console.error("Error fetching users:", error);
            return {
                status: 500,
                message: "Error fetching users",
                data: null,
            };
        }
    });
}
exports.getAllUsers = getAllUsers;
