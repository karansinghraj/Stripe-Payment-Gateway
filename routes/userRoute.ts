import express from "express";
import {
  CreateUser,
  GetUserById,
  GetAllUsers,
} from "../controllers/userController";
import { requestCountMiddleware } from "../middleware/subVerification";
const userRoute = express.Router();

/**
 * @swagger
 * /api/user/createuser:
 *   post:
 *     summary: Create a new user
 *     description: Endpoint for registering a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The password of the user
 *     responses:
 *       "200":
 *         description: Successful operation
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: number
 *             message:
 *               type: string
 *             data:
 *               type: null
 *       "500":
 *         description: Internal Server Error
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: An error message
 */

userRoute.post("/createuser", CreateUser);

/**
 * @swagger
 *  /api/user/getuserbyid:
 *    get:
 *      summary: Get user by ID
 *      description: Retrieve user details based on their ID
 *      parameters:
 *        - in: query
 *          name: userId
 *          description: ID of the user to retrieve
 *          required: true
 *          type: string
 *      responses:
 *        "200":
 *          description: Successful operation
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                description: The username of the user
 *              email:
 *                type: string
 *                format: email
 *                description: The email address of the user
 *        "500":
 *          description: Internal Server Error
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                description: An error message
 */
userRoute.get("/getuserbyid", requestCountMiddleware, GetUserById);

/**
 * @swagger
 *  /api/user/getallusers:
 *    get:
 *      summary: Get user by ID
 *      description: Retrieve user details based on their ID
 *      parameters:
 *        - in: query
 *          name: userId
 *          description: ID of the user to retrieve
 *          required: true
 *          type: string
 *      responses:
 *        "200":
 *          description: Successful operation
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                description: The username of the user
 *              email:
 *                type: string
 *                format: email
 *                description: The email address of the user
 *        "500":
 *          description: Internal Server Error
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                description: An error message
 */
userRoute.get("/getallusers", requestCountMiddleware, GetAllUsers);

export { userRoute };
