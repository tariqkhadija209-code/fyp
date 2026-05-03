import pandas as pd
from sklearn.tree import DecisionTreeClassifier
import joblib

# 1. Training Data (SNA bacho ko Block A aur IT bacho ko Block B mein bhejte hain)
data = {
    'course': ['SNA', 'SNA', 'IT', 'CS', 'IT', 'SNA', 'CS'],
    'suggested_block': ['A', 'A', 'B', 'C', 'B', 'A', 'C'],
    'suggested_wing': ['Technical', 'Technical', 'IT-Wing', 'Computing', 'IT-Wing', 'Technical', 'Computing']
}

df = pd.DataFrame(data)

# Course ko numbers mein badalna (Simple Label Encoding)
course_mapping = {'SNA': 0, 'IT': 1, 'CS': 2}
df['course_num'] = df['course'].map(course_mapping)

# 2. Model Training
model = DecisionTreeClassifier()
model.fit(df[['course_num']], df['suggested_block']) # Block predict karne ke liye

# 3. Save Model
joblib.dump(model, 'room_allocator.pkl')
print("✅ Room Allocation Model Generated!")