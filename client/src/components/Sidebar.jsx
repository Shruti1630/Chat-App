import React, { useContext } from 'react'
import { ChatContext } from '../context/ChatContext'
import { AuthContext } from '../context/AuthContext'

const Sidebar = () => {
  const { users = [], setSelectedUser } = useContext(ChatContext)
  const { onlineUsers = [] } = useContext(AuthContext)

  return (
    <div style={{ width: '280px', borderRight: '1px solid #374151' }}>
      {users.map((user) => (
        <div
          key={user._id}
          onClick={() => setSelectedUser(user)}
          style={{
            padding: '12px',
            cursor: 'pointer',
            background: onlineUsers.includes(user._id)
              ? 'rgba(79,70,229,0.1)'
              : 'transparent'
          }}
        >
          <div style={{ fontWeight: '500' }}>{user.fullName}</div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Sidebar
