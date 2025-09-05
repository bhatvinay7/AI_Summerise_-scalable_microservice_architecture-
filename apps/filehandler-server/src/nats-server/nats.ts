import { connect, StringCodec,NatsConnection } from "nats";
let natsConnection:NatsConnection;
(async function run(){
    natsConnection = await connect({
    servers: ['nats://nats-server:4222'],
    user: 'natsuser',
    pass: 'natspassword'
  })
    
})()

const sc = StringCodec();

export {sc,natsConnection}
