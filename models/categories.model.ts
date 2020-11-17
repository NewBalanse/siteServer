import {Schema} from "mongoose";

const categoriesSchema: Schema = new Schema({
    name: String,
    logo: String
});

export default categoriesSchema;
