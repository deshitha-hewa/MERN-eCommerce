import asyncHandler from 'express-async-handler'; // Simple middleware for handling exceptions inside of async express routes and passing them to your express error handlers.
import { generateAuthToken } from '../lib/utils.js';
import User from '../models/user.model.js';

// @desc     Auth user & get token
// @route    POST /api/users/login
// @access   Public
export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // matchPassword is checking entered password is correct in user mode
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateAuthToken(user),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc     Register new user
// @route    POST /api/users/
// @access   Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExist = await User.findOne({ email });

  if (userExist) {
    res.status(400);
    throw new Error('User already exist!');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateAuthToken(user),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc     Get user profile
// @route    GET /api/users/profile
// @access   Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc     Update user profile
// @route    PUT /api/users/profile
// @access   Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateAuthToken(updatedUser),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc     Get all users
// @route    GET /api/users
// @access   Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});

  res.json(users);
});

// @desc     Delete all users
// @route    DELETE /api/users/:id
// @access   Private/Admin
export const delteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.remove();
    res.json({ message: 'User removed..!' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc     Get user by ID
// @route    GET /api/users/:id
// @access   Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if(user){
    res.json(user);
  }else{
    res.status(404)
    throw new Error('User not found')
  }
});


// @desc     Update user 
// @route    PUT /api/users/:id
// @access   Private
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = req.body.isAdmin || user.isAdmin;
    
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
