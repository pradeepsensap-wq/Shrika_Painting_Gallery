# Firebase Setup Instructions

Your Painting Gallery now uses Firebase for cloud storage! Follow these steps to get it working:

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it "shrika-painting-gallery"
4. Enable Google Analytics if you want (optional)
5. Click "Create project"

## Step 2: Set Up Firestore Database

1. In the Firebase Console, click on "Firestore Database" in the left menu
2. Click "Create database"
3. Choose "Start in production mode"
4. Select a location (closest to you)
5. Click "Create"

## Step 3: Set Up Storage

1. In the Firebase Console, click on "Storage" in the left menu
2. Click "Get Started"
3. Leave the default security rules
4. Click "Done"

## Step 4: Get Your Firebase Config

1. In Firebase Console, click the Settings icon ⚙️
2. Go to "Project settings"
3. Scroll to "Your apps" section
4. Look for "Web" app (or create one if needed)
5. Copy the Firebase config object

## Step 5: Update app.js with Your Config

Replace the `firebaseConfig` object in `app.js` with your actual Firebase credentials:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

## Step 6: Configure Firestore Security Rules

In Firebase Console > Firestore Database > Rules, replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /paintings/{document=**} {
      allow read: if true;
      allow create: if true;
      allow update: if request.auth.uid == resource.data.userId;
      allow delete: if true;
    }
  }
}
```

## Step 7: Configure Storage Security Rules

In Firebase Console > Storage > Rules, replace with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /paintings/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

## Done!

Push your changes to GitHub and your painting gallery will now use Firebase for cloud storage!

```bash
git add .
git commit -m "Add Firebase integration for cloud storage"
git push origin main
```

Now anyone can add paintings and they'll be shared with everyone visiting the gallery!
