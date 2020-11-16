import {Schema} from "mongoose";

const postSchema: Schema = new Schema({
    name: String,
    postText: String,
    description: String,
    categoryId: String
})

export default postSchema;
