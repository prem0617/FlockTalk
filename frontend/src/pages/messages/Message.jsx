import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useSocket } from "../../context/SocketContext";
import { Send, ArrowLeft } from "lucide-react";
import useUser from "../../context/UserContext";
import { BACKEND_URL } from "../../config";

const Message = () => {
  const { id } = useParams();
  const [text, setText] = useState("");
  const [isUserFollowing, setIsUserFollowing] = useState(false);
  const [receiver, setReceiver] = useState();
  const [isFetchingMessages, setIsFetchingMessages] = useState(true);
  const [isFetchingUser, setIsFetchingUser] = useState(true);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();
  const { user } = useUser();

  const getReceiver = async () => {
    try {
      setIsFetchingUser(true);
      const response = await axios.get(`${BACKEND_URL}/api/user/${id}`, {
        withCredentials: true,
      });
      console.log(response);
      setReceiver(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetchingUser(false);
    }
  };

  const getMessage = async () => {
    try {
      setIsFetchingMessages(true);
      const response = await axios.get(
        `${BACKEND_URL}/api/message/getMessages/${id}`,
        { withCredentials: true }
      );
      console.log(response);
      setMessages(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetchingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim()) return; // Prevent sending empty messages

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/message/sendMessage/${id}`,
        { text },
        { withCredentials: true }
      );

      const newMessage = response.data.message;

      // ✅ Update messages state immediately
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      setText(""); // Clear input after sending
    } catch (error) {
      console.log(error);
      toast.error("Failed to send message");
    }
  };

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  console.log(receiver);

  useEffect(() => {
    const isUserFollowing = user.following.includes(id);

    setIsUserFollowing(isUserFollowing);

    getMessage();
    getReceiver();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message) => {
      console.log(message);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.on("message", handleMessage);

    socket.on("delete", (input) => {
      setMessages([]);
    });

    // Cleanup listener on unmount
    return () => {
      socket.off("message", handleMessage);
    };
  }, [socket]);

  // Format timestamp if available
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (isFetchingUser || isFetchingMessages) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md p-4 flex items-center">
        <Link to="/messages" className="mr-3">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center justify-between w-full">
          <div className="flex">
            {receiver.profileImg ? (
              <img
                src={receiver.profileImg}
                alt=""
                className="h-10 w-10 rounded-full object-contain border-2 border-blue-500"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {receiver?.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="ml-3">
              <h1 className="font-semibold">{receiver?.username}</h1>
              <p className="text-sm text-gray-500">{receiver?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                message?.sender === user?._id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                  message?.sender === user?._id
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none shadow"
                }`}
              >
                <p>{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message?.sender === user?._id
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            name="message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Message;
