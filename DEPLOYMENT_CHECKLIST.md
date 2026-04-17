# Deployment Checklist ✅

## Pre-Deployment

- [ ] Code is committed to GitHub
- [ ] `.env` file is in `.gitignore`
- [ ] MongoDB connection string is ready
- [ ] All features tested locally

## Backend Deployment (Render)

- [ ] Created new Web Service on Render
- [ ] Connected GitHub repository
- [ ] Set Root Directory to `backend`
- [ ] Set Build Command to `npm install`
- [ ] Set Start Command to `npm start`
- [ ] Added all environment variables:
  - [ ] PORT=5000
  - [ ] NODE_ENV=production
  - [ ] MONGO_URI
  - [ ] JWT_SECRET
  - [ ] FRONTEND_URL (set to * initially)
- [ ] Deployment successful
- [ ] Backend URL copied: `_______________________________`
- [ ] Test endpoint: `https://your-backend.onrender.com/` shows success message

## Frontend Configuration

- [ ] Updated `frontend/js/config.js` with backend URL
- [ ] Committed and pushed changes to GitHub
- [ ] Verified config.js has correct URL format (with `/api` at end)

## Frontend Deployment (Vercel)

- [ ] Created new project on Vercel
- [ ] Imported GitHub repository
- [ ] Set Output Directory to `frontend`
- [ ] Deployment successful
- [ ] Frontend URL copied: `_______________________________`
- [ ] Can access login page

## Post-Deployment Configuration

- [ ] Updated `FRONTEND_URL` in Render with Vercel URL
- [ ] Backend redeployed with new CORS settings
- [ ] Tested login functionality
- [ ] Tested student management
- [ ] Tested attendance marking
- [ ] Tested marks entry
- [ ] Tested reports generation

## Security Checks

- [ ] Changed JWT_SECRET from default
- [ ] MongoDB password is strong
- [ ] Environment variables are not exposed
- [ ] CORS is properly configured
- [ ] HTTPS is working on both frontend and backend

## Documentation

- [ ] Updated README.md with live URLs
- [ ] Documented any custom configurations
- [ ] Saved backend and frontend URLs

## Final Testing

- [ ] Create new account works
- [ ] Login works
- [ ] Dashboard loads correctly
- [ ] Can add students
- [ ] Can mark attendance
- [ ] Can enter marks
- [ ] Can generate reports
- [ ] All navigation links work
- [ ] Logout works
- [ ] Mobile responsive (test on phone)

## Monitoring

- [ ] Bookmarked Render dashboard
- [ ] Bookmarked Vercel dashboard
- [ ] Know how to check logs
- [ ] Understand free tier limitations

## Backup Information

**Backend URL:** `_______________________________`

**Frontend URL:** `_______________________________`

**MongoDB URI:** (saved securely)

**JWT Secret:** (saved securely)

**Deployment Date:** `_______________________________`

---

## Notes

Write any issues or special configurations here:

```
[Your notes here]
```

---

## Quick Commands

### Redeploy Backend
```bash
git add .
git commit -m "Update backend"
git push origin main
# Render auto-deploys
```

### Redeploy Frontend
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys
```

### Check Backend Logs
1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab

### Check Frontend Logs
1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Click on latest deployment

---

**Status:** 
- [ ] Not Started
- [ ] In Progress
- [ ] Completed ✅
- [ ] Issues Found (describe below)

**Issues:**
```
[List any issues here]
```
