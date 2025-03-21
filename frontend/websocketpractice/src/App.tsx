import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [userId, setUserId] = useState<number | null>(Math.floor(Math.random() * 1000)) ;
  console.log(socket);

  useEffect( () => {
    const newSocket = new WebSocket('ws://localhost:3000?userId='+userId);
    newSocket.onopen = () => {
      console.log('Connection established');
      if(userId === null){

        setUserId(Math.floor(Math.random() * 1000) );
      }
      newSocket.send(`${userId}`);
    }
    newSocket.onmessage = (chat) => {
      console.log(chat.data);
      console.log('Message received:');
    }
    setSocket(newSocket);
    return () => newSocket.close();
  }, [userId] )
  if(socket){
    socket.onmessage = (chat) => {
      console.log(chat.data);
      console.log('Message received: from if block');
    };
  } 

  return (
    <>
      hi there
    </>
  )
}

export default App
