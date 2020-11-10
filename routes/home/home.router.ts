import {Router} from "express";
import db from "../../bin/dbConfig";
import postSchema from "../../models/post.model";
import mongoose from 'mongoose';
import {PostInterface} from "../../interfaces/post.interface";

const homePageRouter = Router();

homePageRouter.get('/', async (request, response) => {
    const connections = await db();
    const postModel = mongoose.model('post', postSchema);

    postModel.find({}, (err, result: PostInterface[]) => {
        connections.disconnect();
        if (err) return response.status(400).json(err);

        return response.status(200).json(result);
    })
})

export default homePageRouter;
