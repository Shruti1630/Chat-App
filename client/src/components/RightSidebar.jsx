import React, { useEffect, useState, useContext } from 'react'
import assets from '../assets/assets'
import { ChatContext } from '../context/ChatContext'
import { AuthContext } from '../context/AuthContext'

const Rightsidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext)
  const { logout, onlineUsers } = useContext(AuthContext)
  const [msgImages, setMsgImages] = useState([])

  // Get all the images from the messages and set them to state
  useEffect(() => {
    if (messages && messages.length > 0) {
      console.log("📸 Total messages:", messages.length)
      
      // Filter messages that have actual image data
      const images = messages
        .filter(msg => {
          const hasImage = msg.image && msg.image !== 'base64_data' && msg.image.trim() !== ''
          if (hasImage) {
            console.log("📸 Found image in message:", {
              id: msg._id,
              imageLength: msg.image.length,
              preview: msg.image.substring(0, 30) + "..."
            })
          }
          return hasImage
        })
        .map(msg => {
          const imgData = msg.image
          
          // Check if image is already a data URL
          if (imgData.startsWith('data:image/')) {
            console.log("📸 Already a data URL")
            return imgData
          } else if (imgData.startsWith('/') || imgData.startsWith('http')) {
            // If it's a URL path
            console.log("📸 Regular URL")
            return imgData
          } else {
            // Assume it's base64 and needs prefix
            console.log("📸 Adding base64 prefix")
            return `data:image/jpeg;base64,${imgData}`
          }
        })
      
      console.log("📸 Processed images:", images.length)
      setMsgImages(images)
    } else {
      setMsgImages([])
    }
  }, [messages])

  // Handle image click
  const handleImageClick = (url) => {
    if (url.startsWith('data:')) {
      // For base64 images, create a new window
      const newWindow = window.open()
      newWindow.document.write(`
        <html>
          <head><title>Image Preview</title></head>
          <body style="margin:0; background:#1a1a1a; display:flex; justify-content:center; align-items:center; height:100vh;">
            <img src="${url}" style="max-width:90%; max-height:90%; border-radius:8px;" />
          </body>
        </html>
      `)
    } else {
      window.open(url, '_blank')
    }
  }

  if (!selectedUser) {
    return (
      <div className={`bg-[#8185B2]/10 text-white w-full flex items-center justify-center ${"max-md:hidden"}`}>
        <p className="text-gray-400">Select a user to view details</p>
      </div>
    )
  }

  return (
    <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-auto ${selectedUser ? "max-md:hidden" : ""}`}>
      {/* Profile Section */}
      <div className='pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto px-4'>
        <img 
          src={selectedUser.profilePic || assets.avatar_icon} 
          alt={selectedUser.fullName}
          className='w-20 h-20 rounded-full object-cover border-2 border-white/20' 
        />
        <h1 className='text-xl font-medium flex items-center gap-2 mt-2'>
          {onlineUsers && onlineUsers.includes(selectedUser._id) ? (
            <>
              <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></span>
              <span>Online</span>
            </>
          ) : (
            <>
              <span className='w-2 h-2 rounded-full bg-gray-400'></span>
              <span>Offline</span>
            </>
          )}
        </h1>
        <h2 className='text-lg font-semibold'>{selectedUser.fullName}</h2>
        <p className='text-center text-gray-300 mt-1'>
          {selectedUser.bio || "No bio available"}
        </p>
      </div>
      
      <hr className="border-[#ffffff20] my-6 mx-4" />
      
      {/* Media Section */}
      <div className="px-4">
        <div className="flex justify-between items-center mb-3">
          <p className="font-medium">Shared Media</p>
          <span className="text-xs text-gray-400">{msgImages.length} items</span>
        </div>
        
        {msgImages.length > 0 ? (
          <div className='grid grid-cols-3 gap-2'>
            {msgImages.map((url, index) => (
              <div 
                key={index} 
                onClick={() => handleImageClick(url)}
                className='cursor-pointer rounded-lg overflow-hidden group relative'
              >
                <img 
                  src={url} 
                  alt={`Shared ${index + 1}`}
                  className='w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200'
                  onError={(e) => {
                    console.error("❌ Image failed to load:", url.substring(0, 50))
                    e.target.style.display = 'none'
                    e.target.parentElement.innerHTML = `
                      <div class="w-full h-24 bg-gray-800 rounded-lg flex flex-col items-center justify-center">
                        <span class="text-xs text-gray-400">Image</span>
                        <span class="text-[10px] text-gray-500 mt-1">Failed to load</span>
                      </div>
                    `
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-800 flex items-center justify-center">
              <span className="text-2xl">📷</span>
            </div>
            <p className="text-gray-400">No media shared yet</p>
            <p className="text-gray-500 text-sm mt-1">Images will appear here</p>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="absolute bottom-5 left-0 right-0 px-4">
        <button 
          onClick={logout} 
          className='w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-medium py-3 rounded-xl cursor-pointer transition-all duration-200 active:scale-95 shadow-lg'
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Rightsidebar