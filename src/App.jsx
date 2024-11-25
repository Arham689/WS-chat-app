import React, { useEffect, useRef, useState } from 'react'
import { Input } from "./components/ui/input"
import { Button   } from "./components/ui/button"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function App() {
  const [roomId, setRoomId] = useState('')
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([])
  const refWs = useRef()
  const inputRef = useRef() 

  useEffect(()=>{
    const ws = new WebSocket('http://localhost:4040')

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data.userId)
      if (data.type === "userId") {
        // Store the received userId
        setUserId(data.payload.userId);
    } else if (data.type === "chat") {
        // Append new chat messages
        setMessages((prevMessages) => [
            ...prevMessages,
            { userId: data.userId, message: data.message },
        ]);
    }
    }
    
    refWs.current = ws 

    return () => {
      ws.close()
    }

  } , [])
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <ToastContainer />
      <header className="bg-gray-800 p-4">
        <h1 className="text-2xl font-bold">Room-based Chat</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {messages.map((msg, index) => (
        <div
            key={index}
            className={`flex ${
                msg.userId === userId ? "justify-end" : "justify-start"
            }`}
        >
            <div
                className={`max-w-xs rounded-lg p-3 ${
                    msg.userId === userId
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-300"
                }`}
            >
                <p className="text-sm">{msg.message}</p>
            </div>
        </div>
    ))}
      </div>
      <div className="bg-gray-800 p-4">
        <div className="flex space-x-2 mb-4">
          <Input
            type="text"
            placeholder="Enter room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="flex-1"
          />
          <Button onClick={()=>{

            refWs.current.send(JSON.stringify({
              type: "join",
              payload: {
                roomId: roomId
              }
            }))
            roomId.length !== 0 ?  toast.success('JOINED!')  : toast.warn("Can't be Empty")

          }} >
            Join Room
          </Button>
        </div>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Type a message..."
            className="flex-1"
            ref={inputRef}
          />
          <Button onClick={()=>{
            if(roomId.length === 0 )return toast.error("Join a room!"); 
            const message = inputRef.current.value
            if(message.length === 0 ) return toast.warn("message can't be empty")
            refWs.current.send(JSON.stringify({
              "type":"chat",
              "payload":{
                "message" : message ,
                "userID" : userId
               }
            }))
            inputRef.current.value = ''
          }}>
           send
          </Button>
        </div>
      </div>
    </div>
  )
}

