# Real-Time Chat Application - Frontend

Modern React frontend for the real-time chat application with Socket.io integration.

## 🚀 Features

- **Authentication**: Login and Registration with JWT
- **Real-time Messaging**: Instant message delivery using Socket.io
- **User Presence**: See who's online
- **Typing Indicators**: Know when someone is typing
- **Chat Management**: Create private chats and group conversations
- **User Search**: Find and start conversations with users
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations

## 🛠️ Tech Stack

- **React 18** - UI Library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client for API calls
- **date-fns** - Date formatting
- **React Icons** - Icon library

## 📦 Installation

### Prerequisites
```bash
Node.js >= 16.x
npm or yarn
```

### Install Dependencies
```bash
cd client
npm install
```

### Environment Configuration

The frontend connects to the backend API via proxy configuration in `vite.config.js`. By default, it points to `http://localhost:5000`.

If you need to change the backend URL, update the proxy settings in `vite.config.js`:

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://your-backend-url:5000',
      changeOrigin: true,
    },
    '/socket.io': {
      target: 'http://your-backend-url:5000',
      ws: true,
    },
  },
}
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
# or
npm start
```

The application will open at `http://localhost:3000`

### Production Build
```bash
npm run build
```

The build will be created in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
client/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable React components
│   │   ├── ChatList.jsx
│   │   ├── ChatWindow.jsx
│   │   ├── Header.jsx
│   │   └── Message.jsx
│   ├── context/         # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── SocketContext.jsx
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Chat.jsx
│   ├── styles/          # CSS files
│   ├── App.jsx          # Main App component
│   └── main.jsx         # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## 🎨 Features Walkthrough

### Authentication
- User registration with username, email, and password
- Secure login with JWT tokens
- Automatic token refresh
- Protected routes

### Chat Interface
- **Sidebar**: List of all conversations with last message preview
- **Chat Window**: Main messaging area with real-time updates
- **Header**: User profile and settings

### Real-time Features
- Instant message delivery
- Online/offline status indicators
- Typing indicators
- Message read receipts
- New message notifications

## 🔌 API Integration

The frontend communicates with the backend through:

### REST API Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat
- `GET /api/messages/:chatId` - Get chat messages
- `POST /api/messages` - Send message
- `DELETE /api/messages/:id` - Delete message
- `GET /api/users` - Get all users

### Socket.io Events

#### Client → Server
- `join_chat` - Join a chat room
- `send_message` - Send a message
- `typing` - Notify typing status
- `delete_message` - Delete a message

#### Server → Client
- `new_message` - Receive new message
- `message_deleted` - Message deletion notification
- `user_typing` - User is typing
- `user_online` - User came online
- `user_offline` - User went offline

## 🎯 Usage

1. **Register/Login**: Create an account or login
2. **Start a Chat**: Click the "+" button to start a new conversation
3. **Select a User**: Choose from the list of available users
4. **Send Messages**: Type and send messages in real-time
5. **Manage Chats**: Switch between different conversations

## 🎨 Customization

### Styling
All styles are in the `src/styles/` directory. The app uses CSS custom properties (CSS variables) for theming:

```css
:root {
  --primary-color: #2e9ef7;
  --primary-dark: #1d7bc7;
  --secondary-color: #667eea;
  /* ... more variables */
}
```

Change these values to customize the look and feel.

### Components
Components are modular and can be easily customized or extended. Each component is in its own file with associated styles.

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🐛 Troubleshooting

### Backend Connection Issues
- Ensure the backend server is running on `http://localhost:5000`
- Check the proxy configuration in `vite.config.js`
- Verify CORS settings on the backend

### Socket.io Connection Issues
- Check browser console for connection errors
- Verify the JWT token is valid
- Ensure the backend Socket.io server is running

### Build Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

## 🚀 Deployment

### Deploy to Vercel
```bash
npm run build
vercel deploy
```

### Deploy to Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Deploy with Docker
```bash
# Build
docker build -t chat-frontend .

# Run
docker run -p 3000:3000 chat-frontend
```

## 📄 License

MIT License

## 👨‍💻 Author

**Anuj Kumar**
- GitHub: [@Ares-cmd](https://github.com/Ares-cmd)
- Email: anujkumar6792@gmail.com

