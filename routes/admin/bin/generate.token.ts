import jwt from 'jsonwebtoken';
import api from "../../../bin/api";
import {AdminInterface} from "../../../interfaces/admin.interface";

const generationToken = (res: AdminInterface, id): AdminInterface => {
    const expiration = api.DB_ENV === 'testing' ? 100 : 604800000;

    res.token = jwt.sign({data: id}, api.JWT_SECRET, {
        expiresIn: expiration,
    });

    return res;
};

export default generationToken;
