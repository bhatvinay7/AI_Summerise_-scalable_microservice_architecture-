import { connect, StringCodec,NatsConnection } from "nats";
let natsCOnnection:NatsConnection;
(async function run(){
    natsCOnnection= await connect({ servers:"nats://natsServer:4222" });

})()

const sc = StringCodec();

export {sc,natsCOnnection}
