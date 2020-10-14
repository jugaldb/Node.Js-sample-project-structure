const bcrypt = require("bcrypt");
require("../Node.Js-sample-project-structure/node_modules/dotenv").config();
const jwt = require("jsonwebtoken");
const Admin = require("../Node.Js-sample-project-structure/Models/admin");


const adminRegister = (req, res, next) => {
	Admin.find({ email: req.body.email })
		.exec()
		.then((admin) => {
			if (admin.length >= 1) {
        res.status(409).json({
          message:"Email Exists"
        })
			} else {
				bcrypt.hash(req.body.password, 10, (err, hash) => {
					if (err) {
						return res.status(500).json({
							error: err,
						});
					} else {
						const admin = new Admin({
							_id: new mongoose.Types.ObjectId(),
							email: req.body.email,
							password: hash,
              name: req.body.name,
              phone_number: req.body.phone_number
						});
						admin
							.save()
							.then(async (result) => {
								await result
									.save()
									.then((result1) => {
                      console.log(`admin created ${result}`)
                      res.status(201).json({
                        adminDetails: {
                          adminId: result._id,
                          email: result.email,
                          name: result.name,
                          phone_number: result.phone_number,
                        },
                      })
									})
									.catch((err) => {
                    console.log(err)
                    res.status(400).json({
                      message: err.toString()
                    })
									});
							})
							.catch((err) => {
                console.log(err)
                res.status(500).json({
                  message: err.toString()
                })
							});
					}
				});
			}
		})
		.catch((err) => {
      console.log(err)
      res.status(500).json({
        message: err.toString()
      })
    });
}


const adminLogin = (req, res, next) => {
	Admin.find({ email: req.body.email })
		.exec()
		.then((admin) => {
      console.log(admin)
			if (admin.length < 1) {
				return res.status(401).json({
					message: "Auth failed: Email not found probably",
				});
			}
			bcrypt.compare(req.body.password, admin[0].password, (err, result) => {
				if (err) {
          console.log(err)
					return res.status(401).json({
						message: "Auth failed",
					});
				}
				if (result) {
					const token = jwt.sign(
						{
              adminId: admin[0]._id,
							email: admin[0].email,
							name: admin[0].name,
							phone_number: admin[0].phone_number,
						},
						process.env.jwtSecret,
						{
							expiresIn: "1d",
						}
          );
          console.log(admin[0])
					return res.status(200).json({
						message: "Auth successful",
						adminDetails: {
							adminId: admin[0]._id,
							name: admin[0].name,
							email: admin[0].email,
							phone_number: admin[0].phone_number,
						},
						token: token,
					});
				}
				res.status(401).json({
					message: "Auth failed1",
				});
			});
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
}

const getMe = async (req, res) => {
	const adminId = req.admin.adminId;
	const admin = await Admin.findById(adminId);
	if (admin) {
		res.status(200).json({
			message: "Found",
			admin,
		});
	} else {
		res.status(400).json({
			message: "Bad request",
		});
	}
};

module.exports = {
  adminLogin,
  adminRegister,
	getMe,
};
