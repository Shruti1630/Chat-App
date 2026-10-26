import React, { useRef, useEffect, useState, useContext } from 'react'
import { ChatContext } from '../context/ChatContext'
import { AuthContext } from '../context/AuthContext'
import { toast } from 'react-toastify'

const ChatContainer = () => {
  const {
    messages = [],
    selectedUser,
    sendMessage,
    getMessages
  } = useContext(ChatContext)

  const { authUser, onlineUsers = [] } = useContext(AuthContext)

  const scrollEnd = useRef(null)
  const [input, setInput] = useState('')

  /* ---------------- SEND TEXT ---------------- */
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) {
      toast.error('Message cannot be empty')
      return
    }

    try {
      await sendMessage({ text: input.trim() })
      setInput('')
    } catch (err) {
      console.error(err)
      toast.error('Failed to send message')
    }
  }

  /* ---------------- SEND IMAGE ---------------- */
  const handleSendImage = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Select a valid image')
      return
    }

    const reader = new FileReader()
    reader.onloadend = async () => {
      await sendMessage({
        text: '',
        image: reader.result
      })
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  /* ---------------- LOAD MESSAGES ---------------- */
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id)
    }
  }, [selectedUser])

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* ---------------- NO USER SELECTED ---------------- */
  if (!selectedUser) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#9ca3af',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: 22 }}>💬</div>
        <p>Select a user to start chatting</p>
      </div>
    )
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* HEADER */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #374151',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: '#4f46e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold'
        }}>
          {selectedUser?.fullName?.[0] || 'U'}
        </div>

        <div>
          <div>{selectedUser.fullName}</div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>
            {onlineUsers.includes(selectedUser._id) ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
        {messages.length === 0 && (
          <p style={{ color: '#9ca3af' }}>No messages yet</p>
        )}

        {messages.map((msg, i) => {
          const isMine =
            msg?.senderId === authUser?._id ||
            msg?.sender?._id === authUser?._id

          return (
            <div
              key={msg?._id || i}
              style={{
                display: 'flex',
                justifyContent: isMine ? 'flex-end' : 'flex-start',
                marginBottom: 12
              }}
            >
              <div style={{
                background: isMine ? '#4f46e5' : '#374151',
                color: '#fff',
                padding: '10px 14px',
                borderRadius: 16,
                maxWidth: '70%'
              }}>
                {msg?.text}
                {msg?.image && (
                  <div style={{ fontSize: 12, opacity: 0.8 }}>📸 Image</div>
                )}
              </div>
            </div>
          )
        })}
        <div ref={scrollEnd} />
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSendMessage}
        style={{ padding: 16, display: 'flex', gap: 10 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${selectedUser.fullName}`}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 20,
            border: '1px solid #374151',
            background: '#111827',
            color: '#fff'
          }}
        />

        <input
          type="file"
          id="img"
          accept="image/*"
          hidden
          onChange={handleSendImage}
        />

        <label htmlFor="img" style={{ cursor: 'pointer', padding: 10 }}>
          📎
        </label>

        <button
          type="submit"
          disabled={!input.trim()}
          style={{
            padding: '0 20px',
            borderRadius: 20,
            border: 'none',
            background: '#4f46e5',
            color: '#fff'
          }}
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default ChatContainer
