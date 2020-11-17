import {Schema} from "mongoose";

const postSchema: Schema = new Schema({
    name: String,
    postText: String,
    description: String,
    categoryId: String,
    logo: String
})

export default postSchema;
