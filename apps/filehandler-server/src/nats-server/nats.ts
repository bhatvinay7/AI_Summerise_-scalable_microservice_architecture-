import { connect, StringCodec,NatsConnection } from "nats";
let natsCOnnection:NatsConnection;
(async function run(){
    natsCOnnection= await connect({ servers:"nats://natsuser:natspassword@nats-server:4222" });

})()

const sc = StringCodec();

export {sc,natsCOnnection}
