const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const mailer = require("../utils/mailer");
const bcryptjs = require("bcryptjs");
var ip = require("ip");
// console.dir(ip.address());
const register = asyncHandler(async (req, res) => {
  const { name, email, password, pic, sex, phone, birth } = req.body;
  // console.log(req.body);
  if (!name || !email || !password || !sex || !phone || !birth) {
    res.status(400);
    throw new Error("Pls enter all Fields");
  }
  // console.log("xxxxx");
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }
  const phoneExits = await User.findOne({ phone });
  if (phoneExits) {
    res.status(400);
    throw new Error("User already exists");
  }
  const user = await User.create({
    name,
    email,
    password,
    pic,
    sex,
    phone,
    birth,
  });
  if (user) {
    bcryptjs.hash(user.email, 10).then((hashMail) => {
      console.log(
        `${process.env.APP_URL}/verify?email=${user.email}&token=${hashMail}`
      );
      mailer.sendMail(
        user.email,
        "Verify Email",
        `<a href="http://${ip.address()}:5000/api/user/verify?email=${
          user.email
        }&token=${hashMail}">Verify</a>`
      );
    });
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
      phone: user.phone,
      birth: user.birth,
      sex: user.sex,
    });
  } else {
    res.status(400);
    throw new Error("Cant create User ");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    if (user.email_verified_at == null) {
      console.log("XIN HAY VAO XAC THUC BANG EMAIL");
      res.status(402);
      throw new Error("Verify by email to complete the registration process");
    } else {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        sex: user.sex,
        phone: user.phone,
        birth: user.birth,
        pic: user.pic,
        token: generateToken(user._id),
      });
      console.log("Dung + XAC THUC GOI");
    }
  } else {
    console.log("Sai Tai khoan");
    res.status(401);
    throw new Error("Wrong email or password");
  }
});
// /api/user?search=xxx
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { phone: req.query.search },
          { email: req.query.search },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

const verify = asyncHandler(async (req, res) => {
  console.log("DO DO DO");
  bcryptjs.compare(req.query.email, req.query.token, (err, result) => {
    if (result == true) {
      User.findOneAndUpdate(
        { email: req.query.email },
        { email: req.query.email, email_verified_at: new Date() },
        (err, data) => {
          if (err) console.log(err);
          else {
            console.log("XONG XONG XONG");
            res.render("thanks");
          }
        }
      );
    } else {
      console.log("Ko tim ra");
    }
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { userId, name, pic, sex, birth } = req.body;
  // const userExists = await User.findOne({ _id: userId });
  // if(!userExists ){
  //   res.status(400);
  //   throw new Error("User is not exists");
  // }
  // console.log(userId);
  if (!name ||  !sex || !birth) {
    res.status(400);
    throw new Error("Pls enter all Fields");
  }
  // if (userExists) {
  //   res.status(400);
  //   throw new Error("User already exists");
  // }
  // const { userId } = req.body;
  const userNew = await User.findByIdAndUpdate(
    {
      _id: userId
    },
    {
      name,
      pic,
      sex,
      birth,
    }
  );
  if (userNew) {
    res.status(200).json({
      _id: userNew._id,
      name: userNew.name,
      email: userNew.email,
      pic: userNew.pic,
      phone: userNew.phone,
      birth: userNew.birth,
      sex: userNew.sex,
    });
  } else {
    res.status(400);
    throw new Error("Cant update User ");
  }
});

module.exports = { register, authUser, allUsers, verify, updateProfile  };
