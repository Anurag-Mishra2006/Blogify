// for hashing password use node:crypto
const {createHmac,randomBytes } = require("node:crypto")
const {Schema , model} = require("mongoose")
const { type } = require("os")
const { createTokenforUser } = require("../services/authentication")

const userSchema = new Schema({
        fullName:{
            type:String,
            required: true
        },
        email : {
            type:String,
            required : true,
            unique: true 
        },
        // for password to keep safe we use salt and papering
        salt:{
            type:String,
        },
        password:{
            type:String,
            required:true,
        },
        profileImage:{
            type:String,
            default:'/public/default.png'
        },
        role:{
            type:String,
            enum:["USER","ADMIN"],
            default:"USER",
        },


},{timestamps:true})

userSchema.pre('save', function(next){
    const user = this;
    if(!user.isModified('password'))return ;

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac("sha256",salt)
                            .update(user.password)
                            .digest("hex");

    this.salt = salt;
    this.password = hashedPassword;

    next();
})

// making a virtual function
userSchema.static('matchPasswordAndGenerateToken',async function(email,password){
    const user =await this.findOne({email});
    if(!user) throw new Error("User not found...")  ;

    const salt = user.salt;
    // const salt = randomBytes(16).toString();  

    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256",salt)
                                .update(password)
                                .digest("hex");

    if(hashedPassword !== userProvidedHash) throw new Error("Incorrect Password.")
    
    // else return {...user._doc , password:undefined, salt:undefined}
    // return user; // in play of returning user lets return token 
    const token = createTokenforUser(user);
    return  token;
})

const User = model('user',userSchema);

module.exports = User;