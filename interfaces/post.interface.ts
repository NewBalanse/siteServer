import {Document} from "mongoose";

export interface PostInterface extends Document {
    name: string;
    postText: string;
    images: any[];
    descriptions: string;
    _id: string;
}
