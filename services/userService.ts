import { User } from "../schema/user"; // Import the User schema

async function createUser(model: any) {
  try {
    const { username, email, password } = model;
    console.log(model);
    // Create a new user instance
    const newUser = new User({
      username: username,
      email: email,
      password: password,
    });

    // Save the user to the database
    const savedUser = await newUser.save();
    console.log("User created:", savedUser);
    return {
      status: 200,
      message: "User Created Successfully",
      data: null,
    }; // Send the saved user object as a response
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      status: 500,
      message: "Internal server error",
      data: null,
    }; // Send an error response
  }
}

async function getUserById(model: any) {
  try {
    const { userId } = model; // Extract userId from request parameters
    console.log(userId);
    // Find the user by ID in the database
    const user = await User.findOne({ _id: userId });

    // If user is found, send it as a response
    if (user) {
      return {
        status: 200,
        message: "Success",
        data: user,
      };
    } else {
      return {
        status: 200,
        message: "User not found",
        data: null,
      };
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      status: 500,
      message: "Internal server error",
      data: null,
    };
  }
}

async function getAllUsers() {
  try {
    // Find all users in the database
    const users = await User.find();

    // Send the list of users as a response
    return {
      status: 200,
      message: "Success",
      data: users,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      status: 500,
      message: "Error fetching users",
      data: null,
    };
  }
}
export { createUser, getAllUsers, getUserById };
