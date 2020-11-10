import express from 'express';
import routes from "./routes";
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));


app.use('/', routes);

app.listen(port, () => {
    console.log('server listening port, ', port);
})
