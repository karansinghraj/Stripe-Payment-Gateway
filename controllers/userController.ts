import { createUser, getUserById, getAllUsers } from "../services/userService";
import { Request, Response } from "express";

async function CreateUser(req: Request, res: Response) {
  const model = req.body;
  console.log(req.body);
  const response = await createUser(model);
  res.status(response.status).json(response);
}

async function GetUserById(req: Request, res: Response) {
  const model = req.query;
  const response = await getUserById(model);
  res.status(response.status).json(response);
}

async function GetAllUsers(req: Request, res: Response) {
  const response = await getAllUsers();
  res.status(response.status).json(response);
}

export { CreateUser, GetUserById, GetAllUsers };
