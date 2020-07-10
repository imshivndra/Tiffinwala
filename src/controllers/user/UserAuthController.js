
const {
    badRequestError,
    unAuthorizedError,
    createdResponse,
    unverifiedEmailError,
    okResponse,
    notFoundError,
    to
} = require("../../global_functions");
const CONFIG = require('../../config/index');
const User = require("../../models/user/userModel");
const { signToken } = require("../../middlewares/passport");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Create new user profile

const SignUp = async (req, res) => {
    let error;
    let data = req.body;
    if (!data.fullName) return badRequestError(res, "Please enter Fullname");
    if (!data.dob) return badRequestError(res, "Please enter date of birth");
    let user_inserted;
    [error, user_inserted] = await to(User.query().skipUndefined().insert(data).returning("*"));
    if (error) return badRequestError(res, error.message);
  
    // let verificationToken = jwt.sign({email:user_inserted["email"]},CONFIG.JWT_SECRET,{expiresIn : "300s"});

    // let verificationToken = jwt.sign({email:user_inserted["email"]},CONFIG.JWT_SECRET,{expiresIn : "300s"});

    // let verificationLink = "localhost:8000/api/user/confirmEmail?token="+verificationToken;
    // user_inserted.verificationLink = verificationLink;

    delete user_inserted.password;

    return okResponse(res, user_inserted, "Signup Sucessfully");
}

// Confirm Email after signup

// const ConfirmEmail = async(req,res)=>{
//     let data = req.query;
    
//     let verify = jwt.verify(data.token,CONFIG.JWT_SECRET,(err,result)=>{
//         if(err) return badRequestError(res,"Link Expired.Please try again.");
//         else return result;
//     });
//     let check_user;
//     check_user = await User.query().skipUndefined().where("email", verify["email"]).first().returning("*");
//     if (!check_user) return badRequestError(res, "Link expired");

//     let update_email_status = await check_user.$query().patch({
//         isEmailVerified: true
//     });

//     return okResponse(res,"Email Confirmed.");
// }

// Login registered user

const Login = async (req, res) => {
    let data = req.body;
    let error;
    if (!data.email) return badRequestError(res, "Please enter email");
    if (!data.password) return badRequestError(res, "Please enter password");

    let user_detail;
    [error, user_detail] = await to(User.query().skipUndefined().where("email", data.email).first());
    if (user_detail === undefined) return badRequestError(res, "Invalid email");

    let verify = await bcrypt.compare(data.password, user_detail.password);
    if (!verify) return unAuthorizedError(res, "Incorrect Password");
  
    // // you can change res as per your requirement or can use custom error message with code.
    // if (user_detail.isEmailVerified === false) return unverifiedEmailError(res, "Email is not verified. Please verify email");

    let auth_token = await signToken(user_detail.email,user_detail.id);
    res.setHeader('Authorization', auth_token);
    res.setHeader('access-control-expose-headers', 'authorization');

    return okResponse(res, "Loged In");
}

// Get user details

const GetUser = async (req, res) => {
    // let data = req.body;

    let user_data = await User.query().skipUndefined().where("email", req.user.email).first().returning("*");
    if(user_data === undefined) return notFoundError(res,"No user detail found");
    
    delete user_data.password;
    return okResponse(res, user_data, "User Profile");

}

// Forgot Password

const ForgotPassword = async(req,res)=>{
    let data = req.body;
    let error;
    if(!data.email) return  badRequestError(res,"Please enter email");

    let user_detail;
    [error, user_detail] = await to(User.query().skipUndefined().where("email", data.email).first());
    if (user_detail === undefined) return badRequestError(res, "Invalid email");

    let verificationToken = jwt.sign({email:user_detail["email"]},CONFIG.JWT_SECRET,{expiresIn : "300s"});

    let verificationLink = "localhost:8000/api/user/verifyResetLink?token="+verificationToken;

    return okResponse(res,verificationLink,"Please verify your email");
}

// Verify email after sending verification link for reset password

const VerifyResetLink = async(req,res)=>{
    let data = req.query;

    let verify = await jwt.verify(data.token,CONFIG.JWT_SECRET,(err,result)=>{
        if(err) return badRequestError(res,"Link Expired.Please try again.");
        else return result;
    });
    let check_user;
    check_user = await User.query().skipUndefined().where("email", verify["email"]).first().returning("*");
    if (!check_user) return badRequestError(res, "Link expired");

    let resetToken = jwt.sign({email:check_user["email"]},CONFIG.JWT_SECRET,{expiresIn : "5m"});

    return okResponse(res,resetToken,"Email Verified");

}

// Reset Password 

const ResetPassword = async(req,res)=>{
    let data = req.body;
    if(!data.oldPassword) return badRequestError(res,"Please enter Old Password");
    if(!data.newPassword) return badRequestError(res,"Please enter New Password");

    let user = await User.query().skipUndefined().where("email",req.user.email).first();
    if(user === undefined) return badRequestError(res,"Error in resetting new password");

    let verifyOldPassword = await bcrypt.compare(data.oldPassword,user.password);
    if(!verifyOldPassword) return badRequestError(res,"Incorrect Old Password");

    data.newPassword ? data.newPassword =  await bcrypt.hash(data.newPassword,10) : null;
    let update_user = await user.$query().update({
        password : data.newPassword
    })

    return okResponse(res,"Password Reset. Now you can login");
}




module.exports = {
    SignUp,
    Login,
    GetUser,
    // ConfirmEmail,
    ForgotPassword,
    VerifyResetLink,
    ResetPassword
}