import dotenv from 'dotenv';
import mongoose from 'mongoose';
import api from '../bin/api/index';

dotenv.config();
const url = api.MONGO_URI;

const db = () => {
    return mongoose.connect(url, {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true})
        .catch((error) => console.log(error));
}

export default db;
