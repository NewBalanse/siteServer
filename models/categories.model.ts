import {Schema} from "mongoose";

const categoriesSchema: Schema = new Schema({
    name: String,
});

export default categoriesSchema;
