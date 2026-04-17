# ZP School Redgaon - Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (for frontend)
- Render account (for backend)
- MongoDB Atlas account (already configured)

## Backend Deployment (Render)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Production ready"
git push origin main
```

### Step 2: Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `zp-school-backend` (or your choice)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 3: Add Environment Variables on Render
Go to "Environment" tab and add:
```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://jagrutibharsat08_db_user:yCMMotzZ8cOhwGbm@cluster0.kqipgsf.mongodb.net/zp_redgaon?appName=Cluster0
JWT_SECRET=zp_redgaon_secret_key_2024
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Step 4: Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Copy your backend URL (e.g., `https://zp-school-backend.onrender.com`)

---

## Frontend Deployment (Vercel)

### Step 1: Update API Configuration
1. Open `frontend/js/config.js`
2. Replace `your-render-backend.onrender.com` with your actual Render backend URL:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : 'https://YOUR-ACTUAL-RENDER-URL.onrender.com/api';
```

### Step 2: Commit Changes
```bash
git add frontend/js/config.js
git commit -m "Update backend URL"
git push origin main
```

### Step 3: Deploy on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: (leave empty)
   - **Output Directory**: `frontend`

### Step 4: Deploy
- Click "Deploy"
- Wait for deployment to complete
- Copy your frontend URL (e.g., `https://zp-school-redgaon.vercel.app`)

### Step 5: Update Backend CORS
1. Go back to Render dashboard
2. Update the `FRONTEND_URL` environment variable with your Vercel URL
3. Redeploy the backend service

---

## Post-Deployment Steps

### 1. Test the Application
- Visit your Vercel URL
- Try to sign up and log in
- Test all features

### 2. Update Login Page
If you have a separate login page, make sure it also includes:
```html
<script src="js/config.js"></script>
```

### 3. Monitor Logs
- **Render**: Check logs in the "Logs" tab
- **Vercel**: Check deployment logs and function logs

---

## Important Notes

### Free Tier Limitations
- **Render Free Tier**: 
  - Service spins down after 15 minutes of inactivity
  - First request after spin-down may take 30-60 seconds
  - 750 hours/month free

- **Vercel Free Tier**:
  - Unlimited bandwidth
  - 100 GB bandwidth/month
  - Automatic HTTPS

### Security Recommendations
1. Change the JWT_SECRET to a strong random string
2. Consider using environment-specific secrets
3. Enable MongoDB IP whitelist (currently set to allow all: 0.0.0.0/0)
4. Add rate limiting to prevent abuse

### Troubleshooting

**CORS Errors:**
- Verify FRONTEND_URL in Render matches your Vercel URL exactly
- Check browser console for specific error messages

**API Not Responding:**
- Render free tier spins down - first request may be slow
- Check Render logs for errors
- Verify all environment variables are set correctly

**Database Connection Issues:**
- Verify MongoDB connection string is correct
- Check MongoDB Atlas network access settings
- Ensure database user has proper permissions

---

## Local Development

To run locally after deployment:

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
Open `frontend/index.html` in a browser or use a local server:
```bash
cd frontend
python -m http.server 3000
# or
npx serve
```

---

## Support

For issues or questions:
1. Check Render and Vercel logs
2. Verify environment variables
3. Test API endpoints directly using Postman or curl
4. Check MongoDB Atlas connection

---

## Quick Reference

### Backend URL Structure
```
https://your-backend.onrender.com/api/auth/login
https://your-backend.onrender.com/api/students
https://your-backend.onrender.com/api/attendance
```

### Frontend URL
```
https://your-app.vercel.app
```

### Environment Variables Checklist
- [ ] PORT
- [ ] NODE_ENV
- [ ] MONGO_URI
- [ ] JWT_SECRET
- [ ] FRONTEND_URL
