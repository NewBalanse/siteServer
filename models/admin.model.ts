import {Schema} from "mongoose";


const adminSchema: Schema = new Schema({
    email: String,
    username: String,
    password: String,
    salt: String,
    posts: [],
    token: String
});

// @ts-ignore
export default adminSchema;
