//make function to authorize users to access the APIs after login
const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
    //get token from header
    const token = req.header('x-auth-token');
    //check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    //verify token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded.user;
        next();
    }
    catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
}

//where all to call this function
// Path: APIs/Authentication_user/auth.js
// Path: APIs/Authentication_user/user.js
// Path: APIs/Authentication_user/profile.js
// Path: APIs/Authentication_user/posts.js


// how to call the function in the routes
// Path: APIs/Authentication_user/auth.js
// Path: APIs/Authentication_user/user.js
// Path: APIs/Authentication_user/profile.js
// Path: APIs/Authentication_user/posts.js


// module.exports.isAuthorized  = function(req, res, next) {

//     User.findById(req.session.userId).exec(function (error, user) {
//         if (error) {
//             return next(error);
//         } else {      
//             if (user === null) {     
//                 var err = new Error('Not authorized! Go back!');
//                 err.status = 401;
//                 return next(err);
//             } else {
//                 return next();
//             }
//         }
//     });
// }

