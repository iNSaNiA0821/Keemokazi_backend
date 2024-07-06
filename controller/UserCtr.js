const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const User = require("../models/UserModel");
const Web3 = require("web3");
const Provider = require("@truffle/hdwallet-provider");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const { contract721ABI } = require("../config/abi");
const {
  ownerPrivateKey,
  campNFT721Address,
  rpcURL,
  ownerAddress,
} = require("../config/mint_data");

// @route   POST api/users/register
// @desc    Register user
// @access  Public
exports.register = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user)
      return res.status(400).json({ errors: "Email account already exists!" });

    const newUser = new User({
      email: req.body.email,
      password: req.body.password,
      balanceof: "0",
      subscription: false,
    });

    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password, salt);

    const savedUser = await newUser.save();

    res
      .status(200)
      .json({ msg: "Successfully Registered!", savedUser: savedUser });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ errors: "Server error!" });
  }
};

// @route   POST api/users/login
// @desc    Login user / returning JWT token
// @access  Public
exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user)
      return res
        .status(400)
        .json({ errors: "Email account is not registered!" });
    else {
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword)
        return res.status(400).json({ errors: "Password is not correct!" });

      // JWT things
      const payload = {
        id: user.id,
        email: user.email,
        balanceof: user.balanceof,
        subscription: user.subscription,
      };

      const token = await jwt.sign(payload, keys.JWTKey, { expiresIn: 3600 });

      res.status(200).json({ msg: "Successfully Logged in!", token: token });
    }
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ errors: "Server error!" });
  }
};

exports.buyowner = async (req, res) => {
  try {
    const findUser = await User.findOne({ email: req.body.email });

    if (findUser) {
      findUser.balanceof = findUser.balanceof + 1;

      const updatedUser = await findUser.save();
      // JWT things
      const payload = {
        id: updatedUser.id,
        email: updatedUser.email,
        balanceof: updatedUser.balanceof,
        subscription: updatedUser.subscription,
      };

      const token = await jwt.sign(payload, keys.JWTKey, { expiresIn: 3600 });

      res.status(200).json({ msg: "Successfully minted!", token: token });
    } else {
      res
        .status(400)
        .json({ errors: "Can't find your Email, Please Login Again!" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ errors: "Server error!" });
  }
};

exports.getBalance = async (req, res) => {
  try {
    const findUser = await User.findOne({ email: req.body.email });
    if (findUser) {
      res.status(200).json({ findUser: findUser });
    } else {
      res
        .status(400)
        .json({ errors: "Can't find your Email, Please Login Again!" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ errors: "Server error!" });
  }
};

exports.buysubscription = async (req, res) => {
  try {
    const findUser = await User.findOne({ email: req.body.email });
    if (findUser) {
      findUser.subscription = true;

      const updatedUser = await findUser.save();

      const payload = {
        id: updatedUser.id,
        email: updatedUser.email,
        balanceof: updatedUser.balanceof,
        subscription: updatedUser.subscription,
      };

      const token = await jwt.sign(payload, keys.JWTKey, { expiresIn: 3600 });

      res.status(200).json({ msg: "Successfully purchased!", token: token });
    } else {
      return res
        .status(400)
        .json({ errors: "Can't find your Email, Please Login Again!" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ errors: "Server error!" });
  }
};

exports.sendEmail = async (req, res) => {
  const output = `
    <!DOCTYPE html>
      <html>
        <head>
          <style>
            h1 {
              background: greenyellow;
              width: 400px;
              padding: 10px;
              border: 2px solid green;
            }
          </style>
        </head>
        <body>
          <center>
            <div>
              <h1>Email: ${req.body.email}</h1>
              <h1>Username: ${req.body.username}</h1>
              <h1>Instagram Handle: ${req.body.instagram}</h1>
            </div>
          </center>
        </body>
      </html>
  `;

  var transport = nodemailer.createTransport(
    smtpTransport({
      service: "Gmail",
      auth: {
        user: "smartcode132@gmail.com",
        pass: "vzqdixjhiqhnedva",
      },
    })
  );

  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: "Keemokazi Consulting <no-reply@keemokaziconsulting.org>", // sender address
    to: "kareem.hesri@outlook.com, victoryp00821@gmail.com", // list of receivers
    subject: "Keemokazi Consulting", // Subject line
    text: "", // plaintext body
    html: output, // html body
  };

  // send mail with defined transport object
  transport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      // console.log("Message sent: " + response.message);
      res.status(200).json({ msg: "success" });
    }
  });
};

exports.mintFunc = async (req, res) => {
  try {
    const provider = new Provider(ownerPrivateKey, rpcURL);
    const web3 = new Web3(provider);

    const contract721 = new web3.eth.Contract(
      contract721ABI,
      campNFT721Address
    );
    const encodedABI = await contract721.methods.adminMint(1).encodeABI();

    let signedTx = await web3.eth.accounts.signTransaction(
      {
        from: ownerAddress,
        to: campNFT721Address,
        data: encodedABI,
        gas: 500000,
        value: 0,
      },
      ownerPrivateKey
    );

    try {
      await web3.eth
        .sendSignedTransaction(signedTx.rawTransaction)
        .on("error", (error) => console.log(error))
        .then(async (result) => {
          if (result) {
            const findUser = await User.findOne({ email: req.body.email });
            if (findUser) {
              findUser.balanceof = findUser.balanceof + 1;

              const updatedUser = await findUser.save();
              // JWT things
              const payload = {
                id: updatedUser.id,
                email: updatedUser.email,
                balanceof: updatedUser.balanceof,
                subscription: updatedUser.subscription,
              };
              const token = await jwt.sign(payload, keys.JWTKey, {
                expiresIn: 3600,
              });

              if (updatedUser) {
                res.status(200).json({
                  msg: "Successfully minted!",
                  token: token,
                  status: true,
                });
              } else {
                res.status(400).json({ errors: "Network Error!" });
              }
            }
          }
        });
    } catch (err) {
      console.error(err.message);
      res.status(400).json({ errors: "Server error!" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ errors: "Server error!" });
  }
};
