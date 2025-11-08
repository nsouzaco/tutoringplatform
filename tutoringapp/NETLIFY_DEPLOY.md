# 🚀 Deploy to Netlify

## Quick Deploy Options

### Option 1: Netlify CLI (Recommended)

1. **Install Netlify CLI** (if not already installed):
```bash
npm install -g netlify-cli
```

2. **Login to Netlify**:
```bash
netlify login
```

3. **Deploy from the frontend directory**:
```bash
cd tutoring-platform
netlify deploy --prod
```

4. **Follow the prompts**:
   - Choose "Create & configure a new site"
   - Select your team
   - Site name: `tutoring-platform` (or your preferred name)
   - Build command: `npm run build`
   - Publish directory: `build`

---

### Option 2: Netlify Dashboard (Easiest)

1. **Push your code to GitHub** (if not already):
```bash
cd /Users/nat/tutoringapp
git add .
git commit -m "Add new design and prepare for deployment"
git push origin main
```

2. **Go to [Netlify Dashboard](https://app.netlify.com/)**

3. **Click "Add new site" → "Import an existing project"**

4. **Connect to your Git provider** (GitHub)

5. **Select your repository** (`tutoringapp`)

6. **Configure build settings**:
   - Base directory: `tutoring-platform`
   - Build command: `npm run build`
   - Publish directory: `tutoring-platform/build`

7. **Add Environment Variables** (click "Show advanced" → "New variable"):
```
REACT_APP_FIREBASE_API_KEY=AIzaSyC6dHjyw6rrJ84e24GwfwTZt-1Cibuex8k
REACT_APP_FIREBASE_AUTH_DOMAIN=tutoring-f5d07.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tutoring-f5d07
REACT_APP_FIREBASE_STORAGE_BUCKET=tutoring-f5d07.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=233846612932
REACT_APP_FIREBASE_APP_ID=1:233846612932:web:05e3f9c9675ee503b3fa91
REACT_APP_JITSI_DOMAIN=meet.jit.si
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_SOCKET_URL=http://localhost:5001
```

8. **Click "Deploy site"**

---

## ✅ After Deployment

Your site will be available at: `https://YOUR-SITE-NAME.netlify.app`

### Update Backend URL (When backend is deployed)

1. Go to **Site settings** → **Environment variables**
2. Update:
   - `REACT_APP_API_URL` → Your backend URL + `/api`
   - `REACT_APP_SOCKET_URL` → Your backend URL
3. **Trigger redeploy**

---

## 🔧 Configuration Files Created

- ✅ `netlify.toml` - Netlify build configuration
- ✅ Redirects configured for React Router
- ✅ Security headers added

---

## 🎯 Next Steps

1. ✅ Deploy frontend to Netlify
2. 🔄 Deploy backend to Railway
3. 🔗 Connect frontend to backend
4. 🔐 Enable Firebase Authentication
5. 🧪 Test the live app

---

## 📝 Notes

- The build will take ~2-3 minutes
- Netlify provides automatic HTTPS
- Each push to `main` branch will trigger a new deployment
- Preview deployments for pull requests are automatic

