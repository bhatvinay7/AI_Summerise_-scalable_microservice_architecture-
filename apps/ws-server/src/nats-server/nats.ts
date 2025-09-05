import { connect, StringCodec,NatsConnection,Subscription } from "nats";
let natsConnection :NatsConnection;
let subcriber:Subscription;
(async function run(){
    natsConnection = await connect({
    servers: ['nats://nats-server:4222'],
    user: 'natsuser',
    pass: 'natspassword'
  })
    subcriber = natsConnection?.subscribe("file-state-manager");

})()

const sc = StringCodec();

export {sc,subcriber,natsConnection}
