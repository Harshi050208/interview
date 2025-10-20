from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import json
import os
import hashlib
import uuid
from datetime import datetime
import random

app = Flask(__name__)
CORS(app)

# Data storage files
USERS_FILE = 'users.json'
QUESTIONS_FILE = 'questions.json'
INTERVIEWS_FILE = 'interviews.json'
PROGRESS_FILE = 'progress.json'

# Initialize data files
def init_data_files():
    """Initialize JSON data files if they don't exist"""
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'w') as f:
            json.dump({}, f)
    
    if not os.path.exists(QUESTIONS_FILE):
        create_sample_questions()
    
    if not os.path.exists(INTERVIEWS_FILE):
        with open(INTERVIEWS_FILE, 'w') as f:
            json.dump({}, f)
    
    if not os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'w') as f:
            json.dump({}, f)

def create_sample_questions():
    """Create sample questions data"""
    questions = {
        'data-analytics': {
            'easy': [
                {
                    'id': 1,
                    'question': 'What is the primary purpose of data visualization?',
                    'type': 'mcq',
                    'options': ['To make data look pretty', 'To communicate insights effectively', 'To reduce data size', 'To increase data accuracy'],
                    'correct_answer': 'To communicate insights effectively',
                    'keywords': ['communication', 'insights', 'visualization', 'presentation']
                },
                {
                    'id': 2,
                    'question': 'Which tool is commonly used for data analysis?',
                    'type': 'mcq',
                    'options': ['Microsoft Word', 'Excel', 'PowerPoint', 'Notepad'],
                    'correct_answer': 'Excel',
                    'keywords': ['spreadsheet', 'analysis', 'data', 'calculation']
                },
                {
                    'id': 3,
                    'question': 'What does SQL stand for?',
                    'type': 'mcq',
                    'options': ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'System Query Language'],
                    'correct_answer': 'Structured Query Language',
                    'keywords': ['database', 'query', 'structured', 'language']
                },
                {
                    'id': 4,
                    'question': 'Explain the importance of data cleaning in analytics.',
                    'type': 'text',
                    'options': [],
                    'correct_answer': 'Data cleaning ensures accuracy and reliability of analysis results',
                    'keywords': ['accuracy', 'reliability', 'quality', 'preprocessing', 'validation']
                },
                {
                    'id': 5,
                    'question': 'What is a pivot table used for?',
                    'type': 'mcq',
                    'options': ['Creating charts', 'Summarizing and analyzing data', 'Writing formulas', 'Formatting cells'],
                    'correct_answer': 'Summarizing and analyzing data',
                    'keywords': ['summarize', 'analyze', 'pivot', 'data', 'table']
                }
            ],
            'medium': [
                {
                    'id': 6,
                    'question': 'What is the difference between correlation and causation?',
                    'type': 'text',
                    'options': [],
                    'correct_answer': 'Correlation shows relationship between variables, causation shows one variable causes another',
                    'keywords': ['correlation', 'causation', 'relationship', 'variables', 'cause', 'effect']
                },
                {
                    'id': 7,
                    'question': 'Which statistical measure represents the middle value?',
                    'type': 'mcq',
                    'options': ['Mean', 'Median', 'Mode', 'Standard Deviation'],
                    'correct_answer': 'Median',
                    'keywords': ['middle', 'median', 'central', 'tendency']
                }
            ],
            'hard': [
                {
                    'id': 8,
                    'question': 'Explain the concept of statistical significance in hypothesis testing.',
                    'type': 'text',
                    'options': [],
                    'correct_answer': 'Statistical significance indicates that results are unlikely due to chance',
                    'keywords': ['significance', 'hypothesis', 'testing', 'p-value', 'confidence', 'chance']
                }
            ]
        },
        'machine-learning': {
            'easy': [
                {
                    'id': 9,
                    'question': 'What is machine learning?',
                    'type': 'mcq',
                    'options': ['Programming computers', 'Teaching computers to learn from data', 'Creating websites', 'Building databases'],
                    'correct_answer': 'Teaching computers to learn from data',
                    'keywords': ['learning', 'data', 'algorithms', 'patterns', 'prediction']
                },
                {
                    'id': 10,
                    'question': 'What is supervised learning?',
                    'type': 'mcq',
                    'options': ['Learning without guidance', 'Learning with labeled data', 'Learning from mistakes', 'Learning automatically'],
                    'correct_answer': 'Learning with labeled data',
                    'keywords': ['supervised', 'labeled', 'training', 'guidance', 'examples']
                }
            ],
            'medium': [
                {
                    'id': 11,
                    'question': 'Explain overfitting in machine learning.',
                    'type': 'text',
                    'options': [],
                    'correct_answer': 'Overfitting occurs when a model learns training data too well and fails to generalize',
                    'keywords': ['overfitting', 'generalization', 'training', 'validation', 'bias', 'variance']
                }
            ],
            'hard': [
                {
                    'id': 12,
                    'question': 'Compare different ensemble methods and their advantages.',
                    'type': 'text',
                    'options': [],
                    'correct_answer': 'Ensemble methods combine multiple models to improve performance and reduce overfitting',
                    'keywords': ['ensemble', 'models', 'performance', 'bagging', 'boosting', 'stacking']
                }
            ]
        },
        'web-development': {
            'easy': [
                {
                    'id': 13,
                    'question': 'What does HTML stand for?',
                    'type': 'mcq',
                    'options': ['HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Management Language'],
                    'correct_answer': 'HyperText Markup Language',
                    'keywords': ['html', 'markup', 'hypertext', 'web', 'structure']
                },
                {
                    'id': 14,
                    'question': 'What is CSS used for?',
                    'type': 'mcq',
                    'options': ['Creating databases', 'Styling web pages', 'Writing server code', 'Managing files'],
                    'correct_answer': 'Styling web pages',
                    'keywords': ['css', 'styling', 'design', 'presentation', 'layout']
                }
            ],
            'medium': [
                {
                    'id': 15,
                    'question': 'Explain the difference between frontend and backend development.',
                    'type': 'text',
                    'options': [],
                    'correct_answer': 'Frontend handles user interface, backend handles server logic and database',
                    'keywords': ['frontend', 'backend', 'interface', 'server', 'database', 'logic']
                }
            ],
            'hard': [
                {
                    'id': 16,
                    'question': 'Discuss microservices architecture and its benefits.',
                    'type': 'text',
                    'options': [],
                    'correct_answer': 'Microservices architecture breaks applications into small, independent services for scalability',
                    'keywords': ['microservices', 'architecture', 'scalability', 'independent', 'services', 'deployment']
                }
            ]
        },
        'dsa': {
            'easy': [
                {
                    'id': 17,
                    'question': 'What is the time complexity of binary search?',
                    'type': 'mcq',
                    'options': ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
                    'correct_answer': 'O(log n)',
                    'keywords': ['binary', 'search', 'logarithmic', 'complexity', 'efficient']
                },
                {
                    'id': 18,
                    'question': 'What is a stack data structure?',
                    'type': 'mcq',
                    'options': ['First In First Out', 'Last In First Out', 'Random Access', 'No Order'],
                    'correct_answer': 'Last In First Out',
                    'keywords': ['stack', 'lifo', 'push', 'pop', 'last', 'first']
                }
            ],
            'medium': [
                {
                    'id': 19,
                    'question': 'Explain dynamic programming and provide an example.',
                    'type': 'text',
                    'options': [],
                    'correct_answer': 'Dynamic programming solves complex problems by breaking them into simpler subproblems',
                    'keywords': ['dynamic', 'programming', 'subproblems', 'optimization', 'memoization']
                }
            ],
            'hard': [
                {
                    'id': 20,
                    'question': 'Design an efficient algorithm for finding the shortest path in a weighted graph.',
                    'type': 'text',
                    'options': [],
                    'correct_answer': 'Dijkstra\'s algorithm or Floyd-Warshall for shortest path in weighted graphs',
                    'keywords': ['dijkstra', 'shortest', 'path', 'weighted', 'graph', 'algorithm']
                }
            ]
        },
        'group-discussion': {
            'easy': [
                {
                    'id': 21,
                    'question': 'What is the most important skill in group discussions?',
                    'type': 'mcq',
                    'options': ['Speaking loudly', 'Listening actively', 'Interrupting others', 'Being aggressive'],
                    'correct_answer': 'Listening actively',
                    'keywords': ['listening', 'active', 'communication', 'respect', 'understanding']
                },
                {
                    'id': 22,
                    'question': 'How should you handle disagreements in a group discussion?',
                    'type': 'text',
                    'options': [],
                    'correct_answer': 'Present your point respectfully and consider others\' perspectives',
                    'keywords': ['respectful', 'perspective', 'disagreement', 'constructive', 'collaborative']
                }
            ],
            'medium': [
                {
                    'id': 23,
                    'question': 'Explain the role of a facilitator in group discussions.',
                    'type': 'text',
                    'options': [],
                    'correct_answer': 'A facilitator guides the discussion, ensures participation, and maintains focus',
                    'keywords': ['facilitator', 'guide', 'participation', 'focus', 'leadership', 'moderation']
                }
            ],
            'hard': [
                {
                    'id': 24,
                    'question': 'Discuss strategies for managing dominant participants in group discussions.',
                    'type': 'text',
                    'options': [],
                    'correct_answer': 'Use techniques like direct addressing, time limits, and encouraging others to participate',
                    'keywords': ['dominant', 'participants', 'management', 'inclusion', 'balance', 'techniques']
                }
            ]
        },
        'cloud-computing': {
            'easy': [
                {
                    'id': 25,
                    'question': 'What is cloud computing?',
                    'type': 'mcq',
                    'options': ['Computing in the sky', 'Delivering computing services over the internet', 'Using only local computers', 'Storing data on CDs'],
                    'correct_answer': 'Delivering computing services over the internet',
                    'keywords': ['cloud', 'internet', 'services', 'computing', 'delivery', 'remote']
                },
                {
                    'id': 26,
                    'question': 'What are the main types of cloud services?',
                    'type': 'mcq',
                    'options': ['IaaS, PaaS, SaaS', 'Hardware, Software, Network', 'Public, Private, Hybrid', 'All of the above'],
                    'correct_answer': 'IaaS, PaaS, SaaS',
                    'keywords': ['iaas', 'paas', 'saas', 'infrastructure', 'platform', 'software']
                }
            ],
            'medium': [
                {
                    'id': 27,
                    'question': 'Explain the benefits of cloud computing for businesses.',
                    'type': 'text',
                    'options': [],
                    'correct_answer': 'Cost reduction, scalability, flexibility, and reduced maintenance overhead',
                    'keywords': ['cost', 'scalability', 'flexibility', 'maintenance', 'benefits', 'business']
                }
            ],
            'hard': [
                {
                    'id': 28,
                    'question': 'Discuss cloud security challenges and mitigation strategies.',
                    'type': 'text',
                    'options': [],
                    'correct_answer': 'Security challenges include data breaches, compliance, and access control; mitigation involves encryption and monitoring',
                    'keywords': ['security', 'challenges', 'encryption', 'monitoring', 'compliance', 'access control']
                }
            ]
        }
    }
    
    # Add more questions to reach the required counts
    for domain in questions:
        for difficulty in questions[domain]:
            current_count = len(questions[domain][difficulty])
            target_count = {'easy': 45, 'medium': 30, 'hard': 15}[difficulty]
            
            # Duplicate and modify existing questions to reach target count
            while current_count < target_count:
                base_question = questions[domain][difficulty][current_count % len(questions[domain][difficulty])]
                new_question = base_question.copy()
                new_question['id'] = current_count + 1
                questions[domain][difficulty].append(new_question)
                current_count += 1
    
    with open(QUESTIONS_FILE, 'w') as f:
        json.dump(questions, f, indent=2)

# Main route
@app.route('/')
def index():
    return send_file('index.html')

# Routes for serving static files
@app.route('/styles.css')
def styles():
    return send_file('styles.css')

@app.route('/script.js')
def script():
    return send_file('script.js')

@app.route('/favicon.ico')
def favicon():
    return '', 204

# API Routes
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({'message': 'Server is working', 'timestamp': datetime.now().isoformat()}), 200

@app.route('/api/signup', methods=['POST'])
def signup():
    print("signup: Endpoint called")
    try:
        data = request.get_json()
        print(f"signup: Raw request data: {data}")
        
        email = data.get('email') if data else None
        password = data.get('password') if data else None
        fullName = data.get('fullName') if data else None
        
        print(f"signup: Received data - email: {email}, password: {'*' * len(password) if password else 'None'}, fullName: {fullName}")
        
        if not all([email, password, fullName]):
            print("signup: Missing required fields")
            return jsonify({'message': 'All fields are required'}), 400
    except Exception as e:
        print(f"signup: Error parsing request data: {e}")
        return jsonify({'message': 'Invalid request data'}), 400
    
    # Load existing users
    users = {}
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            users = json.load(f)
    
    print(f"signup: Loaded {len(users)} existing users")
    
    # Check if user already exists
    if email in users:
        print(f"signup: User {email} already exists")
        return jsonify({'message': 'User already exists'}), 400
    
    # Create new user
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    users[email] = {
        'email': email,
        'password_hash': password_hash,
        'fullName': fullName,
        'credits': 0,
        'streak': 0,
        'accuracy': 0,
        'created_at': datetime.now().isoformat(),
        'interviewsCompleted': 0
    }
    
    # Save users
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)
    
    print(f"signup: Successfully created user {email}")
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    print("login: Endpoint called")
    try:
        data = request.get_json()
        print(f"login: Raw request data: {data}")
        
        email = data.get('email') if data else None
        password = data.get('password') if data else None
        
        print(f"login: Received data - email: {email}, password: {'*' * len(password) if password else 'None'}")
        
        if not all([email, password]):
            print("login: Missing required fields")
            return jsonify({'message': 'Email and password are required'}), 400
    except Exception as e:
        print(f"login: Error parsing request data: {e}")
        return jsonify({'message': 'Invalid request data'}), 400
    
    # Load users
    users = {}
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            users = json.load(f)
    
    print(f"login: Loaded {len(users)} users from file")
    
    # Check credentials
    if email not in users:
        print(f"login: User {email} not found in users")
        return jsonify({'message': 'Invalid credentials'}), 401
    
    user = users[email]
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    print(f"login: Stored hash: {user.get('password_hash', 'None')[:10]}...")
    print(f"login: Computed hash: {password_hash[:10]}...")
    
    if user['password_hash'] != password_hash:
        print("login: Password hash mismatch")
        return jsonify({'message': 'Invalid credentials'}), 401
    
    # Generate token
    token = str(uuid.uuid4())
    
    # Return user data (excluding password hash)
    user_data = {k: v for k, v in user.items() if k != 'password_hash'}
    
    print(f"login: Successfully logged in user {email}")
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user_data
    }), 200

@app.route('/api/verify-token', methods=['GET'])
def verify_token():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'No token provided'}), 401
    
    # For simplicity, we'll just return the user data
    # In a real app, you'd validate the token
    email = request.args.get('email', 'test@example.com')
    
    users = {}
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            users = json.load(f)
    
    if email not in users:
        return jsonify({'message': 'User not found'}), 401
    
    user = users[email]
    user_data = {k: v for k, v in user.items() if k != 'password_hash'}
    
    print(f"verify-token: Returning user data for {email}: {user_data}")
    
    return jsonify({'user': user_data}), 200

@app.route('/api/questions/<domain>/<difficulty>')
def get_questions(domain, difficulty):
    try:
        if not os.path.exists(QUESTIONS_FILE):
            return jsonify({'message': 'Questions not found'}), 404
        
        with open(QUESTIONS_FILE, 'r') as f:
            all_questions = json.load(f)
        
        if domain not in all_questions or difficulty not in all_questions[domain]:
            return jsonify({'message': 'Domain or difficulty not found'}), 404
        
        # Get all questions for the domain and difficulty
        all_available_questions = all_questions[domain][difficulty].copy()
        
        print(f"DEBUG: Found {len(all_available_questions)} total questions for {domain}/{difficulty}")
        
        # Add timestamp-based seed for unique randomization every second
        import time
        timestamp = int(time.time())
        random.seed(timestamp)
        
        print(f"DEBUG: Using timestamp seed: {timestamp}")
        
        # Define question limits based on difficulty
        limits = {'easy': 45, 'medium': 30, 'hard': 15}
        max_questions = limits.get(difficulty, 15)
        
        # SIMPLIFIED LOGIC: Just shuffle and take the required number
        # This ensures we get different questions each time
        random.shuffle(all_available_questions)
        
        # Take only the required number of questions
        selected_questions = all_available_questions[:max_questions]
        
        print(f"DEBUG: Selected {len(selected_questions)} questions out of {len(all_available_questions)} available")
        
        # Verify questions are different
        question_texts = [q.get('text', '') for q in selected_questions[:5]]
        print(f"DEBUG: First 5 question texts: {question_texts}")
        
        # Randomize options for MCQ questions
        for question in selected_questions:
            if question.get('type') == 'mcq' and question.get('options'):
                # Store correct answer
                correct_answer = question.get('correct_answer')
                # Shuffle options
                random.shuffle(question['options'])
                # Keep the correct answer as the actual answer text (not position)
                question['correct_answer'] = correct_answer
        
        # Reset random seed to system time
        random.seed()
        
        print(f"DEBUG: Returning {len(selected_questions)} questions with timestamp {timestamp}")
        
        return jsonify({
            'questions': selected_questions,
            'total_questions': len(selected_questions),
            'mcq_count': len([q for q in selected_questions if q.get('type') == 'mcq']),
            'text_count': len([q for q in selected_questions if q.get('type') == 'text']),
            'randomization_timestamp': timestamp
        }), 200
        
    except Exception as e:
        print(f"ERROR in get_questions: {str(e)}")
        return jsonify({'message': f'Error loading questions: {str(e)}'}), 500

@app.route('/api/questions-hardcoded/<domain>/<difficulty>')
def get_questions_hardcoded(domain, difficulty):
    """HARDCODED API - Manually creates completely different questions"""
    try:
        print(f"HARDCODED API: Creating unique questions for {domain}/{difficulty}")
        
        # Define question limits - ALL DOMAINS NOW HAVE SAME COUNTS: Easy=45, Medium=30, Hard=15
        limits = {'easy': 45, 'medium': 30, 'hard': 15}
            
        max_questions = limits.get(difficulty, 15)
        
        # MANUALLY CREATE COMPLETELY DIFFERENT QUESTIONS
        # This ensures every question is unique
        sample_questions = []
        
        if domain == 'data-analytics':
            sample_questions = [
                {
                    'id': 1,
                    'text': 'What is the primary purpose of data visualization?',
                    'type': 'mcq',
                    'options': ['To make data look pretty', 'To communicate insights effectively', 'To reduce data size', 'To increase data accuracy'],
                    'correct_answer': 'To communicate insights effectively'
                },
                {
                    'id': 2,
                    'text': 'Which statistical measure represents the middle value in a dataset?',
                    'type': 'mcq',
                    'options': ['Mean', 'Median', 'Mode', 'Standard deviation'],
                    'correct_answer': 'Median'
                },
                {
                    'id': 3,
                    'text': 'What does SQL stand for?',
                    'type': 'mcq',
                    'options': ['Structured Query Language', 'Simple Query Language', 'Statistical Query Logic', 'System Query Language'],
                    'correct_answer': 'Structured Query Language'
                },
                {
                    'id': 4,
                    'text': 'Which of the following is NOT a data visualization tool?',
                    'type': 'mcq',
                    'options': ['Tableau', 'Power BI', 'Microsoft Word', 'D3.js'],
                    'correct_answer': 'Microsoft Word'
                },
                {
                    'id': 5,
                    'text': 'What is the purpose of data cleaning?',
                    'type': 'mcq',
                    'options': ['To make data look better', 'To remove errors and inconsistencies', 'To increase data size', 'To change data format'],
                    'correct_answer': 'To remove errors and inconsistencies'
                },
                {
                    'id': 6,
                    'text': 'What is correlation in statistics?',
                    'type': 'mcq',
                    'options': ['Causation', 'A measure of relationship between variables', 'A type of average', 'A data visualization'],
                    'correct_answer': 'A measure of relationship between variables'
                },
                {
                    'id': 7,
                    'text': 'Which algorithm is used for classification problems?',
                    'type': 'mcq',
                    'options': ['Linear Regression', 'Random Forest', 'K-Means', 'PCA'],
                    'correct_answer': 'Random Forest'
                },
                {
                    'id': 8,
                    'text': 'What is overfitting in machine learning?',
                    'type': 'mcq',
                    'options': ['Training too quickly', 'Model performs well on training data but poorly on test data', 'Using too much data', 'Not enough training time'],
                    'correct_answer': 'Model performs well on training data but poorly on test data'
                },
                {
                    'id': 9,
                    'text': 'What is the difference between supervised and unsupervised learning?',
                    'type': 'mcq',
                    'options': ['No difference', 'Supervised uses labeled data, unsupervised uses unlabeled data', 'Supervised is faster', 'Unsupervised is more accurate'],
                    'correct_answer': 'Supervised uses labeled data, unsupervised uses unlabeled data'
                },
                {
                    'id': 10,
                    'text': 'What is a pivot table used for?',
                    'type': 'mcq',
                    'options': ['Creating charts', 'Summarizing and analyzing data', 'Storing data', 'Cleaning data'],
                    'correct_answer': 'Summarizing and analyzing data'
                },
                {
                    'id': 11,
                    'text': 'What does ETL stand for in data processing?',
                    'type': 'mcq',
                    'options': ['Extract, Transform, Load', 'Enter, Test, Leave', 'Easy, Tough, Long', 'Error, Time, Logic'],
                    'correct_answer': 'Extract, Transform, Load'
                },
                {
                    'id': 12,
                    'text': 'What is the purpose of data warehousing?',
                    'type': 'mcq',
                    'options': ['To store data temporarily', 'To provide a central repository for analytical data', 'To clean data', 'To visualize data'],
                    'correct_answer': 'To provide a central repository for analytical data'
                },
                {
                    'id': 13,
                    'text': 'What is a histogram used for?',
                    'type': 'mcq',
                    'options': ['Showing trends over time', 'Displaying the distribution of data', 'Comparing categories', 'Showing relationships'],
                    'correct_answer': 'Displaying the distribution of data'
                },
                {
                    'id': 14,
                    'text': 'What is the main purpose of A/B testing?',
                    'type': 'mcq',
                    'options': ['To make websites faster', 'To compare two versions of something', 'To store data', 'To analyze user behavior'],
                    'correct_answer': 'To compare two versions of something'
                },
                {
                    'id': 15,
                    'text': 'What is data mining?',
                    'type': 'mcq',
                    'options': ['Extracting data from websites', 'The process of discovering patterns in large datasets', 'Storing data securely', 'Cleaning data'],
                    'correct_answer': 'The process of discovering patterns in large datasets'
                },
                {
                    'id': 16,
                    'text': 'What is the difference between descriptive and predictive analytics?',
                    'type': 'mcq',
                    'options': ['No difference', 'Descriptive explains what happened, predictive forecasts what will happen', 'Descriptive is faster', 'Predictive is more accurate'],
                    'correct_answer': 'Descriptive explains what happened, predictive forecasts what will happen'
                },
                {
                    'id': 17,
                    'text': 'What is a dashboard in business intelligence?',
                    'type': 'mcq',
                    'options': ['A type of database', 'A visual display of key metrics and KPIs', 'A data cleaning tool', 'A programming language'],
                    'correct_answer': 'A visual display of key metrics and KPIs'
                },
                {
                    'id': 18,
                    'text': 'What is the purpose of data governance?',
                    'type': 'mcq',
                    'options': ['To make data faster', 'To ensure data quality, security, and compliance', 'To visualize data', 'To store data'],
                    'correct_answer': 'To ensure data quality, security, and compliance'
                },
                {
                    'id': 19,
                    'text': 'What is a KPI in business analytics?',
                    'type': 'mcq',
                    'options': ['A type of chart', 'Key Performance Indicator - a measurable value', 'A database', 'A programming tool'],
                    'correct_answer': 'Key Performance Indicator - a measurable value'
                },
                {
                    'id': 20,
                    'text': 'What is the purpose of regression analysis?',
                    'type': 'mcq',
                    'options': ['To classify data', 'To understand relationships between variables and make predictions', 'To clean data', 'To store data'],
                    'correct_answer': 'To understand relationships between variables and make predictions'
                },
                {
                    'id': 21,
                    'text': 'What is data profiling?',
                    'type': 'mcq',
                    'options': ['Creating user profiles', 'Analyzing data to understand its structure and quality', 'Storing data', 'Visualizing data'],
                    'correct_answer': 'Analyzing data to understand its structure and quality'
                },
                {
                    'id': 22,
                    'text': 'What is the difference between OLTP and OLAP?',
                    'type': 'mcq',
                    'options': ['No difference', 'OLTP is for transactions, OLAP is for analysis', 'OLTP is faster', 'OLAP is more secure'],
                    'correct_answer': 'OLTP is for transactions, OLAP is for analysis'
                },
                {
                    'id': 23,
                    'text': 'What is a data lake?',
                    'type': 'mcq',
                    'options': ['A physical storage location', 'A repository for storing raw data in its native format', 'A type of database', 'A visualization tool'],
                    'correct_answer': 'A repository for storing raw data in its native format'
                },
                {
                    'id': 24,
                    'text': 'What is the purpose of feature engineering in data science?',
                    'type': 'mcq',
                    'options': ['To build software features', 'To create meaningful input variables for machine learning', 'To clean data', 'To visualize data'],
                    'correct_answer': 'To create meaningful input variables for machine learning'
                },
                {
                    'id': 25,
                    'text': 'What is data lineage?',
                    'type': 'mcq',
                    'options': ['A type of chart', 'The history of data transformations and movements', 'A database', 'A cleaning tool'],
                    'correct_answer': 'The history of data transformations and movements'
                },
                {
                    'id': 26,
                    'text': 'What is the purpose of statistical significance testing?',
                    'type': 'mcq',
                    'options': ['To make data look better', 'To determine if observed differences are likely due to chance', 'To store data', 'To visualize data'],
                    'correct_answer': 'To determine if observed differences are likely due to chance'
                },
                {
                    'id': 27,
                    'text': 'What is a cohort analysis?',
                    'type': 'mcq',
                    'options': ['A type of regression', 'Analysis of user groups over time', 'A data cleaning method', 'A visualization technique'],
                    'correct_answer': 'Analysis of user groups over time'
                },
                {
                    'id': 28,
                    'text': 'What is the purpose of data anonymization?',
                    'type': 'mcq',
                    'options': ['To make data faster', 'To protect privacy by removing identifying information', 'To clean data', 'To store data'],
                    'correct_answer': 'To protect privacy by removing identifying information'
                },
                {
                    'id': 29,
                    'text': 'What is a funnel analysis?',
                    'type': 'mcq',
                    'options': ['A type of chart', 'Analysis of user progression through a process', 'A data cleaning method', 'A storage technique'],
                    'correct_answer': 'Analysis of user progression through a process'
                },
                {
                    'id': 30,
                    'text': 'What is the difference between correlation and causation?',
                    'type': 'mcq',
                    'options': ['No difference', 'Correlation shows relationship, causation shows cause-effect', 'Correlation is faster', 'Causation is more accurate'],
                    'correct_answer': 'Correlation shows relationship, causation shows cause-effect'
                },
                {
                    'id': 31,
                    'text': 'What is data quality assessment?',
                    'type': 'mcq',
                    'options': ['Testing data speed', 'Evaluating data for accuracy, completeness, and consistency', 'Storing data', 'Visualizing data'],
                    'correct_answer': 'Evaluating data for accuracy, completeness, and consistency'
                },
                {
                    'id': 32,
                    'text': 'What is the purpose of segmentation analysis?',
                    'type': 'mcq',
                    'options': ['To divide data into files', 'To group similar data points for targeted analysis', 'To clean data', 'To store data'],
                    'correct_answer': 'To group similar data points for targeted analysis'
                },
                {
                    'id': 33,
                    'text': 'What is a time series analysis?',
                    'type': 'mcq',
                    'options': ['Analyzing data over time', 'A method to analyze data points collected over time', 'Cleaning time data', 'Storing time data'],
                    'correct_answer': 'A method to analyze data points collected over time'
                },
                {
                    'id': 34,
                    'text': 'What is the purpose of data validation?',
                    'type': 'mcq',
                    'options': ['To make data faster', 'To ensure data meets specified criteria and quality standards', 'To store data', 'To visualize data'],
                    'correct_answer': 'To ensure data meets specified criteria and quality standards'
                },
                {
                    'id': 35,
                    'text': 'What is a heatmap in data visualization?',
                    'type': 'mcq',
                    'options': ['A map showing temperature', 'A graphical representation using colors to show data values', 'A type of chart', 'A data storage method'],
                    'correct_answer': 'A graphical representation using colors to show data values'
                },
                {
                    'id': 36,
                    'text': 'What is the purpose of data integration?',
                    'type': 'mcq',
                    'options': ['To make data faster', 'To combine data from different sources into a unified view', 'To clean data', 'To store data'],
                    'correct_answer': 'To combine data from different sources into a unified view'
                },
                {
                    'id': 37,
                    'text': 'What is a data pipeline?',
                    'type': 'mcq',
                    'options': ['A physical pipe', 'A series of data processing steps', 'A type of database', 'A visualization tool'],
                    'correct_answer': 'A series of data processing steps'
                },
                {
                    'id': 38,
                    'text': 'What is the purpose of exploratory data analysis (EDA)?',
                    'type': 'mcq',
                    'options': ['To store data', 'To understand data patterns and generate hypotheses', 'To clean data', 'To visualize data'],
                    'correct_answer': 'To understand data patterns and generate hypotheses'
                },
                {
                    'id': 39,
                    'text': 'What is data storytelling?',
                    'type': 'mcq',
                    'options': ['Writing stories about data', 'Communicating insights through narrative and visualization', 'Storing data stories', 'Cleaning story data'],
                    'correct_answer': 'Communicating insights through narrative and visualization'
                },
                {
                    'id': 40,
                    'text': 'What is the purpose of data cataloging?',
                    'type': 'mcq',
                    'options': ['To make data faster', 'To organize and document data assets for discovery and governance', 'To clean data', 'To store data'],
                    'correct_answer': 'To organize and document data assets for discovery and governance'
                },
                {
                    'id': 41,
                    'text': 'What is a data model?',
                    'type': 'mcq',
                    'options': ['A physical model', 'A conceptual representation of data structures and relationships', 'A type of database', 'A visualization tool'],
                    'correct_answer': 'A conceptual representation of data structures and relationships'
                },
                {
                    'id': 42,
                    'text': 'What is the purpose of data sampling?',
                    'type': 'mcq',
                    'options': ['To make data smaller', 'To select a representative subset of data for analysis', 'To clean data', 'To store data'],
                    'correct_answer': 'To select a representative subset of data for analysis'
                },
                {
                    'id': 43,
                    'text': 'What is a data dictionary?',
                    'type': 'mcq',
                    'options': ['A book about data', 'A reference guide describing data elements and their meanings', 'A type of database', 'A storage method'],
                    'correct_answer': 'A reference guide describing data elements and their meanings'
                },
                {
                    'id': 44,
                    'text': 'What is the purpose of data masking?',
                    'type': 'mcq',
                    'options': ['To hide data', 'To protect sensitive data by replacing it with fake data', 'To clean data', 'To store data'],
                    'correct_answer': 'To protect sensitive data by replacing it with fake data'
                },
                {
                    'id': 45,
                    'text': 'What is data stewardship?',
                    'type': 'mcq',
                    'options': ['Caring for data', 'The management and oversight of data assets and quality', 'Storing data', 'Cleaning data'],
                    'correct_answer': 'The management and oversight of data assets and quality'
                }
            ]
        elif domain == 'machine-learning':
            sample_questions = [
                {
                    'id': 11,
                    'text': 'What is artificial intelligence?',
                    'type': 'mcq',
                    'options': ['A type of computer', 'Intelligence demonstrated by machines', 'A programming language', 'A database system'],
                    'correct_answer': 'Intelligence demonstrated by machines'
                },
                {
                    'id': 12,
                    'text': 'Which type of learning requires labeled training data?',
                    'type': 'mcq',
                    'options': ['Unsupervised learning', 'Supervised learning', 'Reinforcement learning', 'Deep learning'],
                    'correct_answer': 'Supervised learning'
                },
                {
                    'id': 13,
                    'text': 'What is a neural network?',
                    'type': 'mcq',
                    'options': ['A type of database', 'A computer network', 'A computing system inspired by biological neural networks', 'A type of software'],
                    'correct_answer': 'A computing system inspired by biological neural networks'
                },
                {
                    'id': 14,
                    'text': 'What is the purpose of cross-validation?',
                    'type': 'mcq',
                    'options': ['To speed up training', 'To evaluate model performance', 'To reduce data size', 'To improve visualization'],
                    'correct_answer': 'To evaluate model performance'
                },
                {
                    'id': 15,
                    'text': 'Which algorithm is used for clustering?',
                    'type': 'mcq',
                    'options': ['Linear Regression', 'K-Means', 'Random Forest', 'Support Vector Machine'],
                    'correct_answer': 'K-Means'
                },
                {
                    'id': 16,
                    'text': 'What is the purpose of feature scaling in machine learning?',
                    'type': 'mcq',
                    'options': ['To make data smaller', 'To normalize features to similar scales', 'To remove features', 'To add more data'],
                    'correct_answer': 'To normalize features to similar scales'
                },
                {
                    'id': 17,
                    'text': 'What is gradient descent?',
                    'type': 'mcq',
                    'options': ['A type of algorithm', 'An optimization algorithm to minimize cost functions', 'A data structure', 'A visualization method'],
                    'correct_answer': 'An optimization algorithm to minimize cost functions'
                },
                {
                    'id': 18,
                    'text': 'What is the difference between classification and regression?',
                    'type': 'mcq',
                    'options': ['No difference', 'Classification predicts categories, regression predicts continuous values', 'Classification is faster', 'Regression is more accurate'],
                    'correct_answer': 'Classification predicts categories, regression predicts continuous values'
                },
                {
                    'id': 19,
                    'text': 'What is ensemble learning?',
                    'type': 'mcq',
                    'options': ['A single model', 'Combining multiple models to improve performance', 'A type of database', 'A visualization technique'],
                    'correct_answer': 'Combining multiple models to improve performance'
                },
                {
                    'id': 20,
                    'text': 'What is the purpose of regularization in machine learning?',
                    'type': 'mcq',
                    'options': ['To make models faster', 'To prevent overfitting by adding penalty terms', 'To increase accuracy', 'To reduce data size'],
                    'correct_answer': 'To prevent overfitting by adding penalty terms'
                },
                {
                    'id': 21,
                    'text': 'What is a decision tree?',
                    'type': 'mcq',
                    'options': ['A database structure', 'A tree-like model for decision making', 'A visualization tool', 'A type of algorithm'],
                    'correct_answer': 'A tree-like model for decision making'
                },
                {
                    'id': 22,
                    'text': 'What is deep learning?',
                    'type': 'mcq',
                    'options': ['Shallow machine learning', 'A subset of machine learning using neural networks with multiple layers', 'A database system', 'A programming language'],
                    'correct_answer': 'A subset of machine learning using neural networks with multiple layers'
                },
                {
                    'id': 23,
                    'text': 'What is the purpose of activation functions in neural networks?',
                    'type': 'mcq',
                    'options': ['To store data', 'To introduce non-linearity into the network', 'To make networks faster', 'To reduce complexity'],
                    'correct_answer': 'To introduce non-linearity into the network'
                },
                {
                    'id': 24,
                    'text': 'What is bias in machine learning?',
                    'type': 'mcq',
                    'options': ['An error in data', 'Systematic error that makes predictions consistently wrong', 'A type of algorithm', 'A visualization method'],
                    'correct_answer': 'Systematic error that makes predictions consistently wrong'
                },
                {
                    'id': 25,
                    'text': 'What is variance in machine learning?',
                    'type': 'mcq',
                    'options': ['A type of data', 'How much predictions vary for different training sets', 'A database field', 'A measurement tool'],
                    'correct_answer': 'How much predictions vary for different training sets'
                },
                {
                    'id': 26,
                    'text': 'What is the purpose of hyperparameter tuning?',
                    'type': 'mcq',
                    'options': ['To clean data', 'To optimize model performance by adjusting hyperparameters', 'To store models', 'To visualize results'],
                    'correct_answer': 'To optimize model performance by adjusting hyperparameters'
                },
                {
                    'id': 27,
                    'text': 'What is reinforcement learning?',
                    'type': 'mcq',
                    'options': ['A type of database', 'Learning through interaction with environment using rewards and penalties', 'A visualization method', 'A data structure'],
                    'correct_answer': 'Learning through interaction with environment using rewards and penalties'
                },
                {
                    'id': 28,
                    'text': 'What is the curse of dimensionality?',
                    'type': 'mcq',
                    'options': ['A type of algorithm', 'Problems that arise when working with high-dimensional data', 'A database issue', 'A visualization problem'],
                    'correct_answer': 'Problems that arise when working with high-dimensional data'
                },
                {
                    'id': 29,
                    'text': 'What is transfer learning?',
                    'type': 'mcq',
                    'options': ['Moving data between databases', 'Using knowledge from one task to improve performance on another task', 'A type of algorithm', 'A data structure'],
                    'correct_answer': 'Using knowledge from one task to improve performance on another task'
                },
                {
                    'id': 30,
                    'text': 'What is the purpose of dropout in neural networks?',
                    'type': 'mcq',
                    'options': ['To make networks faster', 'To prevent overfitting by randomly setting neurons to zero', 'To increase accuracy', 'To reduce data size'],
                    'correct_answer': 'To prevent overfitting by randomly setting neurons to zero'
                },
                {
                    'id': 31,
                    'text': 'What is a confusion matrix?',
                    'type': 'mcq',
                    'options': ['A type of database', 'A table showing actual vs predicted classifications', 'A visualization tool', 'A data structure'],
                    'correct_answer': 'A table showing actual vs predicted classifications'
                },
                {
                    'id': 32,
                    'text': 'What is precision in machine learning?',
                    'type': 'mcq',
                    'options': ['A type of algorithm', 'The ratio of true positives to all positive predictions', 'A database field', 'A measurement tool'],
                    'correct_answer': 'The ratio of true positives to all positive predictions'
                },
                {
                    'id': 33,
                    'text': 'What is recall in machine learning?',
                    'type': 'mcq',
                    'options': ['A type of algorithm', 'The ratio of true positives to all actual positives', 'A database field', 'A measurement tool'],
                    'correct_answer': 'The ratio of true positives to all actual positives'
                },
                {
                    'id': 34,
                    'text': 'What is the F1 score?',
                    'type': 'mcq',
                    'options': ['A type of algorithm', 'The harmonic mean of precision and recall', 'A database field', 'A measurement tool'],
                    'correct_answer': 'The harmonic mean of precision and recall'
                },
                {
                    'id': 35,
                    'text': 'What is unsupervised learning?',
                    'type': 'mcq',
                    'options': ['Learning with a teacher', 'Learning patterns from unlabeled data', 'A type of database', 'A visualization method'],
                    'correct_answer': 'Learning patterns from unlabeled data'
                },
                {
                    'id': 36,
                    'text': 'What is the purpose of feature selection?',
                    'type': 'mcq',
                    'options': ['To add more features', 'To choose the most relevant features for the model', 'To remove all features', 'To make models faster'],
                    'correct_answer': 'To choose the most relevant features for the model'
                },
                {
                    'id': 37,
                    'text': 'What is a support vector machine?',
                    'type': 'mcq',
                    'options': ['A type of database', 'A classification algorithm that finds optimal decision boundaries', 'A visualization tool', 'A data structure'],
                    'correct_answer': 'A classification algorithm that finds optimal decision boundaries'
                },
                {
                    'id': 38,
                    'text': 'What is the purpose of principal component analysis (PCA)?',
                    'type': 'mcq',
                    'options': ['To add more features', 'To reduce dimensionality while preserving important information', 'To remove all data', 'To make algorithms faster'],
                    'correct_answer': 'To reduce dimensionality while preserving important information'
                },
                {
                    'id': 39,
                    'text': 'What is bagging in machine learning?',
                    'type': 'mcq',
                    'options': ['A type of algorithm', 'Training multiple models on different subsets of data and combining predictions', 'A database technique', 'A visualization method'],
                    'correct_answer': 'Training multiple models on different subsets of data and combining predictions'
                },
                {
                    'id': 40,
                    'text': 'What is boosting in machine learning?',
                    'type': 'mcq',
                    'options': ['A type of algorithm', 'Sequentially training models where each corrects errors of the previous', 'A database technique', 'A visualization method'],
                    'correct_answer': 'Sequentially training models where each corrects errors of the previous'
                }
            ]
        elif domain == 'web-development':
            sample_questions = [
                {
                    'id': 16,
                    'text': 'What does HTML stand for?',
                    'type': 'mcq',
                    'options': ['HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Markup Language'],
                    'correct_answer': 'HyperText Markup Language'
                },
                {
                    'id': 17,
                    'text': 'What is CSS used for?',
                    'type': 'mcq',
                    'options': ['Creating websites', 'Styling web pages', 'Programming logic', 'Database management'],
                    'correct_answer': 'Styling web pages'
                },
                {
                    'id': 18,
                    'text': 'What does JavaScript do?',
                    'type': 'mcq',
                    'options': ['Styles web pages', 'Adds interactivity to web pages', 'Creates databases', 'Manages servers'],
                    'correct_answer': 'Adds interactivity to web pages'
                },
                {
                    'id': 19,
                    'text': 'What is a responsive web design?',
                    'type': 'mcq',
                    'options': ['Fast loading websites', 'Websites that adapt to different screen sizes', 'Interactive websites', 'Secure websites'],
                    'correct_answer': 'Websites that adapt to different screen sizes'
                },
                {
                    'id': 20,
                    'text': 'What is the purpose of version control?',
                    'type': 'mcq',
                    'options': ['To make websites faster', 'To track changes in code', 'To design better UI', 'To improve SEO'],
                    'correct_answer': 'To track changes in code'
                }
            ]
        else:
            # Default questions for other domains
            sample_questions = [
                {
                    'id': 21,
                    'text': 'What is cloud computing?',
                    'type': 'mcq',
                    'options': ['Using physical servers', 'Computing services delivered over the internet', 'A type of software', 'A programming language'],
                    'correct_answer': 'Computing services delivered over the internet'
                },
                {
                    'id': 22,
                    'text': 'What is the main benefit of cloud computing?',
                    'type': 'mcq',
                    'options': ['Higher costs', 'Scalability and flexibility', 'More complex setup', 'Slower performance'],
                    'correct_answer': 'Scalability and flexibility'
                },
                {
                    'id': 23,
                    'text': 'What is data structures and algorithms?',
                    'type': 'mcq',
                    'options': ['A programming language', 'Ways to organize and process data efficiently', 'A type of database', 'A software tool'],
                    'correct_answer': 'Ways to organize and process data efficiently'
                },
                {
                    'id': 24,
                    'text': 'What is group discussion?',
                    'type': 'mcq',
                    'options': ['A type of exam', 'A method of communication and problem-solving', 'A software tool', 'A programming concept'],
                    'correct_answer': 'A method of communication and problem-solving'
                }
            ]
        
        # Take the required number of questions
        selected_questions = sample_questions[:max_questions]
        
        # Shuffle options for each MCQ question
        import time
        timestamp = int(time.time() * 1000)
        random.seed(timestamp)
        
        for question in selected_questions:
            if question['type'] == 'mcq' and question['options']:
                random.shuffle(question['options'])
        
        random.seed()
        
        print(f"HARDCODED API: Created {len(selected_questions)} unique questions")
        print(f"HARDCODED API: First 3 questions: {[q['text'][:30] + '...' for q in selected_questions[:3]]}")
        
        return jsonify({
            'questions': selected_questions,
            'total_questions': len(selected_questions),
            'mcq_count': len([q for q in selected_questions if q.get('type') == 'mcq']),
            'text_count': len([q for q in selected_questions if q.get('type') == 'text']),
            'randomization_timestamp': timestamp,
            'api_version': 'hardcoded',
            'uniqueness_check': f"{len(selected_questions)}/{len(selected_questions)} unique",
            'duplicate_check': f"{len(selected_questions)} total questions"
        }), 200
        
    except Exception as e:
        print(f"HARDCODED API ERROR: {str(e)}")
        return jsonify({'message': f'Hardcoded API error: {str(e)}'}), 500

@app.route('/api/questions-backup/<domain>/<difficulty>')
def get_questions_backup(domain, difficulty):
    """Backup API endpoint with simplified question selection"""
    try:
        if not os.path.exists(QUESTIONS_FILE):
            return jsonify({'message': 'Questions not found'}), 404
        
        with open(QUESTIONS_FILE, 'r') as f:
            all_questions = json.load(f)
        
        if domain not in all_questions or difficulty not in all_questions[domain]:
            return jsonify({'message': 'Domain or difficulty not found'}), 404
        
        # Get all questions for the domain and difficulty
        questions = all_questions[domain][difficulty]
        
        # Simple randomization without complex logic
        import time
        timestamp = int(time.time())
        random.seed(timestamp)
        
        # Shuffle all questions
        questions_copy = questions.copy()
        random.shuffle(questions_copy)
        
        # Take required number based on difficulty
        limits = {'easy': 45, 'medium': 30, 'hard': 15}
        max_questions = limits.get(difficulty, 15)
        
        selected = questions_copy[:max_questions]
        
        # Shuffle options for MCQ questions
        for q in selected:
            if q.get('type') == 'mcq' and q.get('options'):
                random.shuffle(q['options'])
        
        random.seed()
        
        return jsonify({
            'questions': selected,
            'total_questions': len(selected),
            'mcq_count': len([q for q in selected if q.get('type') == 'mcq']),
            'text_count': len([q for q in selected if q.get('type') == 'text']),
            'randomization_timestamp': timestamp,
            'api_version': 'backup'
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Backup API error: {str(e)}'}), 500

@app.route('/api/user-progress', methods=['GET'])
def get_user_progress():
    progress = {}
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r') as f:
            progress = json.load(f)
    
    return jsonify(progress), 200

@app.route('/api/update-stats', methods=['POST'])
def update_stats():
    data = request.get_json()
    domain = data.get('domain')
    difficulty = data.get('difficulty')
    results = data.get('results')
    
    # Load current user data
    email = request.args.get('email', 'test@example.com')  # In real app, get from token
    users = {}
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            users = json.load(f)
    
    if email not in users:
        return jsonify({'message': 'User not found'}), 404
    
    user = users[email]
    
    # Update user stats with proper calculations
    credits_earned = results.get('creditsEarned', 0)
    user['credits'] = user.get('credits', 0) + credits_earned
    
    # Update interviews completed
    user['interviewsCompleted'] = user.get('interviewsCompleted', 0) + 1
    
    # Update streak based on performance
    current_score = results.get('accuracy', 0)
    if current_score >= 70:  # 70% or higher for good performance
        user['streak'] = user.get('streak', 0) + 1
    else:
        user['streak'] = 0
    
    # Update accuracy (weighted average of all interviews)
    total_interviews = user.get('interviewsCompleted', 0)
    if total_interviews > 1:
        current_overall_accuracy = user.get('accuracy', 0)
        # Calculate weighted average
        user['accuracy'] = ((current_overall_accuracy * (total_interviews - 1)) + current_score) / total_interviews
    else:
        user['accuracy'] = current_score
    
    # Save updated user data
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)
    
    # Update progress
    progress = {}
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r') as f:
            progress = json.load(f)
    
    if email not in progress:
        progress[email] = {}
    
    if domain not in progress[email]:
        progress[email][domain] = {'completed': 0, 'interviews': []}
    
    progress[email][domain]['completed'] += 1
    progress[email][domain]['interviews'].append({
        'difficulty': difficulty,
        'score': results['accuracy'],
        'timestamp': datetime.now().isoformat()
    })
    
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f, indent=2)
    
    # Add logging for debugging
    print(f"Updated stats for {email}: credits={user['credits']}, streak={user['streak']}, accuracy={user['accuracy']:.1f}%, interviews={user['interviewsCompleted']}")
    
    user_data = {k: v for k, v in user.items() if k != 'password_hash'}
    return jsonify({'user': user_data}), 200

@app.route('/api/sync-user-stats', methods=['GET'])
def sync_user_stats():
    try:
        email = request.args.get('email')
        if not email:
            return jsonify({'message': 'Email is required'}), 400
        
        # Load user data
        with open(USERS_FILE, 'r') as f:
            users = json.load(f)
        
        if email not in users:
            return jsonify({'message': 'User not found'}), 404
        
        user = users[email]
        
        # Load interview history to calculate real stats
        interviews = []
        if os.path.exists(INTERVIEWS_FILE):
            with open(INTERVIEWS_FILE, 'r') as f:
                interviews_data = json.load(f)
                interviews = interviews_data.get(email, [])
        
        # Calculate real stats from interview history
        total_credits = sum(interview.get('creditsEarned', 0) for interview in interviews)
        total_interviews = len(interviews)
        total_score = sum(interview.get('score', 0) for interview in interviews)
        overall_accuracy = round(total_score / total_interviews) if total_interviews > 0 else 0
        
        # Calculate streak
        current_streak = 0
        best_streak = 0
        temp_streak = 0
        
        for interview in interviews:
            if interview.get('score', 0) >= 70:
                temp_streak += 1
                current_streak = temp_streak
                if temp_streak > best_streak:
                    best_streak = temp_streak
            else:
                temp_streak = 0
        
        # Update user with real calculated stats
        user['credits'] = total_credits
        user['interviewsCompleted'] = total_interviews
        user['accuracy'] = overall_accuracy
        user['streak'] = current_streak
        
        # Save updated user data
        with open(USERS_FILE, 'w') as f:
            json.dump(users, f, indent=2)
        
        user_data = {k: v for k, v in user.items() if k != 'password_hash'}
        print(f"Synced user stats for {email}: credits={total_credits}, interviews={total_interviews}, accuracy={overall_accuracy}%, streak={current_streak}")
        
        return jsonify(user_data), 200
        
    except Exception as e:
        print(f"Error syncing user stats: {str(e)}")
        return jsonify({'message': f'Error syncing user stats: {str(e)}'}), 500

if __name__ == '__main__':
    init_data_files()
    app.run(debug=True, host='0.0.0.0', port=5000)