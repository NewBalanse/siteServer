import {Router} from "express";
import bodyParser from "body-parser";
import mongoose from 'mongoose';
import adminSchema from "../../models/admin.model";
import db from "../../bin/dbConfig";
import bcrypt from 'bcryptjs';
import {AdminInterface} from "../../interfaces/admin.interface";
import generationToken from "./bin/generate.token";
import postSchema from "../../models/post.model";
import {PostInterface} from "../../interfaces/post.interface";

const urlUnencodedParser = bodyParser.urlencoded({extended: true});

const adminRouter = Router();

adminRouter.get('/', (async (req, res) => {
    try {
        if (!handleRequestAuthorizationHeader(req, 'Bearer')) return res.status(400).json('Unauthorized');
        const token: string = req.headers.authorization.split(' ')[1].trim();

        const connections = await db();
        const adminModel = mongoose.model('admin', adminSchema);

        adminModel.findOne({token}, (err, result: AdminInterface) => {
            connections.disconnect();
            if (err || !result) return res.status(400).json(err);

            return res.status(200).json(result);
        })
    } catch (e) {
        return res.status(400).json(e);
    }
}));

adminRouter.post('/create', urlUnencodedParser, (async (req, res) => {
    try {
        console.log(req.body);
        if (!handleRequestAuthorizationHeader(req, 'Basic')) return res.sendStatus(400);
        if (!req.body.username) return res.sendStatus(400);
        const credentials = getCredentials(req);

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(credentials.password, salt);

        const connection = await db();
        const adminModel = mongoose.model('admin', adminSchema);
        const admin = new adminModel({
            email: credentials.username,
            username: req.body.username,
            password: hash,
            salt
        });

        admin.save((err) => {
            connection.disconnect();
            if (err) return res.json(err);

            return res.json('admin was created');
        })
    } catch (e) {
        return res.json(e);
    }
}));

adminRouter.get('/login', urlUnencodedParser, (async (req, res) => {
    try {
        if (!handleRequestAuthorizationHeader(req, 'Basic')) return res.sendStatus(400);
        const credentials = getCredentials(req);

        const connections = await db();
        const adminModel = mongoose.model('admin', adminSchema);

        adminModel.find({email: credentials.username}, (err, docs: AdminInterface[]) => {
            if (err) return res.json(err);

            docs.forEach(admin => {
                const hash: string = bcrypt.hashSync(credentials.password, admin.salt);

                if (docs) {
                    bcrypt.compare(admin.password.trim(), hash.trim(), (errCompare, resultCompare) => {
                        if (errCompare || resultCompare) return res.sendStatus(400);
                        admin = generationToken(admin, admin._id);

                        adminModel.findByIdAndUpdate(admin._id, admin, {}, (errUpdateAdmin, resultUpdateAdmin) => {
                            connections.disconnect();
                            if (errUpdateAdmin) res.status(400).json('error login');

                            return res.json(admin);
                        })
                    })
                }
            })

        });
    } catch (e) {
        return res.sendStatus(400);
    }
}));

adminRouter.post('/create-post', urlUnencodedParser, (async (req, res) => {
    try {
        if (!handleRequestAuthorizationHeader(req, 'Bearer')) return res.status(400).json('create post error');
        const token: string = req.headers.authorization.split(' ')[1].trim();
        const connection = await db();

        const adminModel = mongoose.model('admin', adminSchema);
        const postModel = mongoose.model('post', postSchema);

        adminModel.findOne({token}, (err, result: AdminInterface) => {
            if (err || !result) return res.status(400).json(err);

            const {name, postText} = req.body;

            const post = new postModel({
                name,
                postText,
                description: (postText as string).substr(0, 120)
            });

            post.save((errSave) => {
                if (errSave) return res.status(400).json(errSave);

                result.posts.push(post);
                adminModel.findByIdAndUpdate(result._id, result, {}, (errUpdate, resultUpdate) => {
                    connection.disconnect();
                    if (errUpdate) {
                        post.remove({_id: post._id}, (errRemovePost, resultRemovePost) => {
                            if (errRemovePost) return res.status(400).json(errRemovePost);

                            return res.status(400).json(errUpdate);
                        })
                    }

                    res.status(200).json(result);
                })
            })
        })
    } catch (e) {
        return res.status(400).json(e);
    }
}));

adminRouter.put('/edit-post/:id', urlUnencodedParser, (async (req, res) => {
    try {
        if (!handleRequestAuthorizationHeader(req, 'Bearer')) return res.status(400).json('Authorization error');
        const token: string = req.headers.authorization.split(' ')[1].trim();

        const connections = await db();
        const adminModel = mongoose.model('admin', adminSchema);
        const postModel = mongoose.model('post', postSchema);

        const postId: string = req.params.id;
        const postToEdit = req.body;

        adminModel.findOne({token}, (err, resultAdmin: AdminInterface) => {
            if (err || !resultAdmin) return res.status(400).json('Unauthorized');

            postModel.findOne({_id: postId}, (errFindPost, resultFindPost: PostInterface) => {
                if (errFindPost || !resultFindPost) return res.status(400).json(errFindPost);

                postModel.updateOne({_id: postId}, Object.assign(resultFindPost, postToEdit), (errUpdatePost, resultUpdatePost) => {
                    if (errUpdatePost) return res.status(400).json(errUpdatePost);

                    connections.disconnect();
                    return res.status(200).json(Object.assign(resultFindPost, postToEdit));
                });
            });
        });

    } catch (e) {
        return res.status(400).json(e);
    }
}));

adminRouter.delete('/delete-post/:id', (async (req, res) => {
    try {
        if (!handleRequestAuthorizationHeader(req, 'Bearer')) return res.status(400).json('Authorization error');
        const token: string = req.headers.authorization.split(' ')[1].trim();

        const connections = await db();
        const postModel = mongoose.model('post', postSchema);
        const adminModel = mongoose.model('admin', adminSchema);

        postModel.findOneAndDelete({_id: req.params.id}, (errDelete, resultDelete) => {
            if (errDelete) return res.status(400).json('cannot find post');

            adminModel.findOne({token}, (errFindAdmin, resultAdmin: AdminInterface) => {
                if (errFindAdmin || !resultAdmin) return res.status(400).json('Unauthorized');

                resultAdmin.posts = resultAdmin.posts.filter(x => x._id.toString() !== req.params.id.toString());
                adminModel.updateOne({token}, resultAdmin, (errUpdateAdmin, resultUpdateAdmin) => {
                    connections.disconnect();
                    if (errUpdateAdmin) return res.status(400).json('error update admin');

                    return res.status(200).json(resultAdmin);
                });
            });
        });
    } catch (e) {
        return res.status(400).json(e);
    }
}));

adminRouter.delete('/delete-posts', urlUnencodedParser, (async (req, res) => {
    try {
        if (!handleRequestAuthorizationHeader(req, 'Bearer')) return res.status(400).json('Authorization error');
        const token: string = req.headers.authorization.split(' ')[1].trim();

        const connection = await db();
        const postModel = mongoose.model('post', postSchema);
        const adminModel = mongoose.model('admin', adminSchema);

        const idFotDelete: string[] = req.body.idForDelete;
        idFotDelete.forEach(_id => {
            postModel.findOneAndDelete({_id: _id.toString()}, (errDeletePost, resultDeletePost) => {
                if (errDeletePost && resultDeletePost) {
                    connection.disconnect();
                    return res.status(400).json(errDeletePost);
                }
            })
        });

        adminModel.findOne({token}, (errorFindAdmin, resultFindAdmin: AdminInterface) => {
            if (errorFindAdmin) return res.status(400).json(errorFindAdmin);

            resultFindAdmin.posts = resultFindAdmin.posts.filter(x => !idFotDelete.includes(x._id.toString()));
            adminModel.updateOne({token}, resultFindAdmin, (errUpdateAdmin, resultUpdateAdmin) => {
                connection.disconnect();
                if (errUpdateAdmin) return res.status(400).json(resultFindAdmin);

                return res.status(200).json('posts was deleted');
            })
        })

    } catch (e) {
        return res.status(400).json(e);
    }
}))

const handleRequestAuthorizationHeader = (req, headerName: string): boolean => {
    return req.headers.authorization && req.headers.authorization.indexOf(`${headerName} `) !== -1;
}

const getCredentials = (req): { username: string, password: string } => {
    const basicToken: string = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(basicToken, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    return {username, password};
}

export default adminRouter;