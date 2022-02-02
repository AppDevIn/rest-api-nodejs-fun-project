import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import config from "config";

export interface UserDocument extends mongoose.Document {
    email: string;
    name: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    composePassword(candidatePassword: string): Promise<boolean>
}

const UserScheme = new mongoose.Schema(
    {
        email: {type: String, required: true, unique: true},
        name: {type: String, required: true},
        password: {type: String, required: true}
    },
    {timestamps: true}
);

UserScheme.pre("save", async function (next) {
    let user = this as UserDocument;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified("password")) return next();

    // Random additional data
    const salt = await bcrypt.genSalt(config.get("saltWorkFactor"));

    const hash = await bcrypt.hashSync(user.password, salt);

    // Replace the password with the hash
    user.password = hash;

    return next();
});

// Used for loggin in
UserScheme.methods.composePassword = async function (candidatePassword) {
    const user = this as UserDocument;
    return bcrypt.compare(candidatePassword, user.password).catch((e) => false);
}

const User = mongoose.model<UserDocument>("User", UserScheme)

export default User
