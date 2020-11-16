import {Document} from "mongoose";
import {PostInterface} from "./post.interface";
import {CategoriesInterface} from "./categories.interface";

export interface AdminInterface extends Document {
    email: string;
    password: string;
    username: string;
    salt: string
    posts: PostInterface[],
    categories: CategoriesInterface[],
    token: string;
    _id: string;
}
