import { createContext, useState, useContext, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { user, token, socket } = useContext(AuthContext);

  /* ===============================
     ✅ Axios instance (FIXED)
  =============================== */
  const api = useMemo(() => {
    return axios.create({
      baseURL: "http://localhost:5000",
      headers: {
        Authorization: token ? `Bearer ${token}` : ""
      }
    });
  }, [token]);

  /* ===============================
     👥 Get users (Sidebar)
  =============================== */
  const getUsers = async () => {
    try {
      const { data } = await api.get("/api/messages/users");

      if (data?.success) {
        setUsers(data.users || []);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      console.error(
        "❌ Error fetching users:",
        error.response?.data || error.message
      );
    }
  };

  /* ===============================
     💬 Get messages
  =============================== */
  const getMessages = async (userId) => {
    try {
      const { data } = await api.get(`/api/messages/${userId}`);

      if (data?.success) {
        setMessages(data.messages || []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error(
        "❌ Error fetching messages:",
        error.response?.data || error.message
      );
      setMessages([]);
    }
  };

  /* ===============================
     📤 Send message
  =============================== */
  const sendMessage = async (messageData) => {
    try {
      if (!selectedUser) {
        toast.error("Select a user first");
        return;
      }

      const payload = {
        text: messageData.text || " ",
        image: messageData.image || "",
        senderId: user?._id,
        receiverId: selectedUser._id
      };

      const { data } = await api.post(
        `/api/messages/send/${selectedUser._id}`,
        payload
      );

      if (data?.success) {
        const newMessage = {
          ...data.newMessage,
          senderId: user._id,
          receiverId: selectedUser._id
        };

        setMessages((prev) => [...prev, newMessage]);

        if (socket) socket.emit("sendMessage", newMessage);
      }
    } catch (error) {
      console.error("🔥 Send message error:", error.response?.data || error.message);
      toast.error("Failed to send message");
    }
  };

  /* ===============================
     📷 Image → base64
  =============================== */
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const uploadImage = async (file) => {
    return await fileToBase64(file);
  };

  /* ===============================
     🔌 Socket listener
  =============================== */
  useEffect(() => {
    if (!socket) {
      console.log("⏳ Socket not ready yet");
      return;
    }

    const handleNewMessage = (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        setMessages((prev) => [...prev, newMessage]);

        api.put(`/api/messages/mark/${newMessage._id}`).catch(() => {});
      } else if (newMessage.senderId !== user?._id) {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedUser, user, api]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        selectedUser,
        unseenMessages,
        setSelectedUser,
        getUsers,
        getMessages,
        sendMessage,
        uploadImage
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
};
