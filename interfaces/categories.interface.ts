import {Document} from 'mongoose';

export interface CategoriesInterface extends Document {
    _id: string;
    name: string;
    logo: string;
}
