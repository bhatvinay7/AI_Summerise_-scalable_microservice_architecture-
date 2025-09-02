import { createClient,RedisClientType } from 'redis';
import dotenv from 'dotenv';
dotenv.config();
const client:RedisClientType = createClient({
    username:process.env.username,
    password:process.env.password,
    socket: {
        host: process.env.host,
        port:parseInt(process.env.port!)
    }
});

client.on('error',( err:any) => console.log('Redis Client Error', err));


export default client;
