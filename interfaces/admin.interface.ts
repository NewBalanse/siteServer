import {Document} from "mongoose";
import {PostInterface} from "./post.interface";

export interface AdminInterface extends Document {
    email: string;
    password: string;
    username: string;
    salt: string
    posts: PostInterface[],
    token: string;
    _id: string;
}
