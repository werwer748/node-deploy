const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: 'email', //req.body.email
        passwordField: 'password', //req.body.password
    }, async (email, password, done) => {
        try{
            const exUser = await User.findOne({ where: { email } });
            if(exUser){
                const result = await bcrypt.compare(password, exUser.password);
                if(result){
                    done(null, exUser); //done(null(서버에러), exUser(로그인성공시) false(로그인실패시), {실패시 메시지}) -인자 3개
                }
                else{
                    done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
                }
            }
            else{
                done(null, false, { message: '가입되지 않은 회원입니다.' });
            }
        }
        catch(error){
            console.error(error);
            done(error);
        }
    }));
};