import { createClient,RedisClientType } from 'redis';
import dotenv from 'dotenv';
dotenv.config();
const client:RedisClientType = createClient({
    username:process.env.USERNAME,
    password:process.env.PASSWORD,
    socket: {
        host: process.env.HOST,
        port:parseInt(process.env.PORT!)
    }
});

client.on('error',( err:any) => console.log('Redis Client Error', err));


export default client;
