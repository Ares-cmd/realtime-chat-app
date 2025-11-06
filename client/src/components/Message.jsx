import React, { useState } from 'react';
import { format } from 'date-fns';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';
import '../styles/Message.css';

const Message = ({ message, isOwn, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      onDelete(message._id);
    }
  };

  return (
    <div
      className={`message ${isOwn ? 'message-own' : 'message-other'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isOwn && (
        <div className="message-sender">
          {message.sender?.name || 'Unknown'}
        </div>
      )}
      
      <div className="message-content">
        <div className="message-bubble">
          {message.content}
          
          {showActions && isOwn && (
            <div className="message-actions">
              <button
                className="action-btn"
                onClick={handleDelete}
                title="Delete"
              >
                <FiTrash2 />
              </button>
            </div>
          )}
        </div>
        
        <div className="message-time">
          {format(new Date(message.createdAt), 'h:mm a')}
        </div>
      </div>
    </div>
  );
};

export default Message;

