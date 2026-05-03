import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
import joblib

# 1. Heavily Balanced Dataset
data = {
    'description': [
        # --- HIGH ---
        'short circuit in room', 'fire in corridor', 'gas leak in kitchen',
        'ceiling falling off', 'emergency medical help needed', 'wire sparking',
        'smoke coming from board', 'major water pipe burst', 'elevator stuck',
        'someone fainted', 'electric shock',
        
        # --- MEDIUM ---
        'water leakage in washroom', 'broken window glass', 'door lock jammed',
        'drainage blocked', 'tap is leaking', 'wall paint peeling',
        'geyser not heating', 'cupboard handle broken', 'internet down',
        
        # --- LOW (Add many more variants) ---
        'my pillow is too soft', 'pillow cover missing', 'need extra pillow',
        'bedsheet is dirty', 'need room cleaning', 'fan making noise',
        'curtain hook broken', 'table is shaky', 'dust on windows',
        'slow internet connection', 'light bulb fused', 'mosquitoes in room',
        'low water pressure', 'room smell bad', 'dust on chair',
        'pillow is uncomfortable', 'soft pillow problem'
    ],
    'priority': [
        'High', 'High', 'High', 'High', 'High', 'High', 'High', 'High', 'High', 'High', 'High',
        'Medium', 'Medium', 'Medium', 'Medium', 'Medium', 'Medium', 'Medium', 'Medium', 'Medium',
        'Low', 'Low', 'Low', 'Low', 'Low', 'Low', 'Low', 'Low', 'Low', 'Low', 'Low', 'Low', 'Low', 'Low', 'Low', 'Low', 'Low'
    ]
}

df = pd.DataFrame(data)

# 2. Better Vectorization
# min_df=1 matlab agar koi word ek baar bhi aye to ignore na ho
vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english', min_df=1)
X = vectorizer.fit_transform(df['description'])
y = df['priority']

# 3. Model with Class Balancing
# class_weight='balanced' AI ko batata hai ke jo category kam hai usay zyada tawajjo do
model = RandomForestClassifier(n_estimators=300, class_weight='balanced', random_state=42)
model.fit(X, y)

# 4. Save
joblib.dump(model, 'priority_model.pkl')
joblib.dump(vectorizer, 'vectorizer.pkl')

print("✅ AI Brain updated with Class Balancing!")