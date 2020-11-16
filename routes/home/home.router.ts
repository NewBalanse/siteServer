import {Router} from "express";
import db from "../../bin/dbConfig";
import postSchema from "../../models/post.model";
import mongoose from 'mongoose';
import {PostInterface} from "../../interfaces/post.interface";
import categoriesSchema from "../../models/categories.model";
import {CategoriesInterface} from "../../interfaces/categories.interface";

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

homePageRouter.get('/all-categories', async (req, res) => {
    const connection = await db();
    const categoriesModel = mongoose.model('category', categoriesSchema);

    categoriesModel.find({}, (err, result: CategoriesInterface[]) => {
        connection.disconnect();
        if (err) return res.status(400).json(err);

        return res.status(200).json(result);
    })
})

homePageRouter.get('/post-by-category/:id', async (req, res) => {
    const connections = await db();
    const postModel = mongoose.model('post', postSchema);

    postModel.find({categoryId: req.params.id}, (err, result: PostInterface[]) => {
        connections.disconnect();
        if (err) return res.status(400).json(err);

        return res.status(200).json(result);
    })
})

export default homePageRouter;
