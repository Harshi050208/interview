# Interview Ace - AI-Powered Interview Platform

A comprehensive interview platform with camera monitoring, tab switching detection, and AI-powered assessment.

## Features

### 🔐 User Authentication
- Sign up and login system
- Secure password hashing
- Session management

### 📚 Multiple Domains
- Data Analytics
- Machine Learning  
- Web Development
- Data Structures & Algorithms
- Group Discussion
- Cloud Computing

### 🎯 Difficulty Levels
- **Easy**: 45 questions (60 minutes)
- **Medium**: 30 questions (45 minutes)
- **Hard**: 15 questions (30 minutes)

### 🎥 Security & Monitoring
- **Camera & Microphone Permission**: Required before starting (fresh request each time)
- **Camera Preview**: User sees their camera feed before starting
- **Live Camera Feed**: Visible during interview in top-left corner
- **Face Detection**: Auto-submit if no face or multiple faces detected
- **Tab Switching Detection**: Auto-submit if user switches tabs
- **Real-time Status Indicators**: Camera, microphone, focus, and face detection status

### 📝 Question Types
- Multiple Choice Questions (MCQ)
- Text-based questions with keyword matching
- Randomized questions and options
- Proper question numbering (1, 2, 3...)

### 🏆 Performance Tracking
- Credit points system
- Accuracy tracking
- Streak counting
- Progress tracking per domain
- Interview history

## Interview Flow

1. **Domain Selection** → Choose your subject area
2. **Difficulty Selection** → Choose Easy/Medium/Hard
3. **📋 Instructions** → Comprehensive guidelines and requirements
4. **🎥 Permission Request** → Explicit camera & microphone access request
5. **📹 Camera Preview** → User sees their camera feed and confirms it's working
6. **▶️ Start MCQ Test** → Begin the interview with monitoring
7. **📊 Results** → Immediate results with AI assessment

## Technical Stack

- **Frontend**: HTML, CSS, JavaScript (ES6+)
- **Backend**: Python Flask
- **Data Storage**: JSON files
- **Security**: SHA-256 password hashing
- **Monitoring**: WebRTC for camera/microphone access

## Security Features

- **Permission Enforcement**: Interview won't start without camera/mic access
- **Visible Monitoring**: User sees their own camera feed
- **Tab Focus Detection**: Auto-submit if user switches tabs
- **Real-time Status**: Live indicators for all monitoring systems
- **Question Randomization**: Prevents cheating through question order

## File Structure

```
Harshi/
├── app.py              # Flask backend
├── index.html          # Main HTML structure
├── styles.css          # Complete styling
├── script.js           # Frontend functionality
├── requirements.txt    # Dependencies
├── users.json         # User data
├── questions.json     # Question bank
├── progress.json      # User progress
└── interviews.json    # Interview history
```

## Browser Requirements

- Modern browser with WebRTC support
- Camera and microphone access
- JavaScript enabled
- HTTPS recommended for camera access

## Features in Detail

### Camera & Microphone Access
- Explicit permission request with clear explanation
- Camera preview before starting interview
- Live camera feed visible during interview
- Status indicators for camera and microphone

### Tab Switching Detection
- Real-time monitoring of browser focus
- Warning alerts when focus is lost
- Auto-submit after 3 seconds if tab switching detected
- Visual status indicators

### Question Management
- Proper sequential numbering (1, 2, 3...)
- Randomized question order for each interview
- Randomized MCQ options
- Support for both MCQ and text questions

### Results & Assessment
- Immediate results after interview completion
- AI-powered keyword matching for text answers
- Credit points based on performance
- Accuracy tracking and streak counting
