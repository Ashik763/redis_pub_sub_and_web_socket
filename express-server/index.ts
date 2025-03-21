import express from "express";
import { createClient } from "redis";
import WebSocket, { WebSocketServer } from 'ws'

export const app = express();
app.use(express.json());


const client = createClient();
// client.on('error', (err) => console.log('Redis Client Error', err));

const users = new Map();

app.post("/submit", async (req, res) => {
    const problemId = req.body.problemId;
    const code = req.body.code;
    const language = req.body.language;

    try {
        await client.lPush("problems", JSON.stringify({ code, language, problemId }));
        // Store in the database
        res.status(200).send("Submission received and stored.");
    } catch (error) {
        console.error("Redis error:", error);
        res.status(500).send("Failed to store submission.");
    }
});

async function startServer() {
    try {
        await client.connect();
        console.log("Connected to Redis");

        const expressServer = app.listen(3000, () => {
            console.log("Server is running on port 3000");
        });


        const wss: WebSocketServer = new WebSocketServer({ server: expressServer });
        
         wss.on('connection', async(ws,req) =>{
             const params = req?.url ? new URLSearchParams(req.url.split('?')[1]) : new URLSearchParams();
             const userId = params.get('userId');
             console.log(`Client connected with ID: ${userId}`);
            ws.on('error', console.error);

            if(!users.get(userId)){
                users.set(userId, ws);
                console.log(userId,'setting user id on the map');
            }

       
            
            ws.on('message',async(data, isBinary) =>{
                console.log(data.toString(), "within chat");

                const submission = await client.brPop("problems", 0);
                // console.log("submission",submission, users.get(submission?.element));
                if(submission?.element){
                  const socket = users.get(submission?.element);
                  console.log("socket sending the message");
                  socket.send(` ws I am 1`);
                }
                
               
                // wss.clients.forEach(client => {
                //     if(client.readyState === WebSocket.OPEN) {
                //         client.send(data,{binary: isBinary});
                //     }
                // })
            })

            // const submission = await client.brPop("problems", 0);
            // console.log(submission, users.get(submission));
            // if(submission){
            //   const socket = users.get(submission);
            //   socket.send(submission);
            // }

            // ws.send("Hello! Message from server");
         });



    } catch (error) {
        console.error("Failed to connect to Redis", error);
    }
}

const initializer = async() =>{
    await startServer();
}   

initializer();


