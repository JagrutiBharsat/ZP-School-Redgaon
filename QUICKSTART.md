# Quick Start Guide

## 🚀 Deploy in 10 Minutes

### Step 1: Deploy Backend to Render (5 minutes)

1. **Push code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Go to Render**
   - Visit: https://dashboard.render.com/
   - Click "New +" → "Web Service"
   - Connect your GitHub repo: `JagrutiBharsat/ZP-School-Redgaon`

3. **Configure Service**
   - Name: `zp-school-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable":
   ```
   PORT=5000
   NODE_ENV=production
   MONGO_URI=mongodb+srv://jagrutibharsat08_db_user:yCMMotzZ8cOhwGbm@cluster0.kqipgsf.mongodb.net/zp_redgaon?appName=Cluster0
   JWT_SECRET=zp_redgaon_secret_key_2024
   FRONTEND_URL=*
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait 2-3 minutes
   - **Copy your backend URL** (e.g., `https://zp-school-backend-xyz.onrender.com`)

---

### Step 2: Update Frontend Config (1 minute)

1. **Edit `frontend/js/config.js`**
   Replace line 4 with your Render URL:
   ```javascript
   : 'https://YOUR-ACTUAL-RENDER-URL.onrender.com/api';
   ```

2. **Commit and push**
   ```bash
   git add frontend/js/config.js
   git commit -m "Update backend URL"
   git push origin main
   ```

---

### Step 3: Deploy Frontend to Vercel (4 minutes)

1. **Go to Vercel**
   - Visit: https://vercel.com/new
   - Click "Import Project"
   - Select your GitHub repo

2. **Configure Project**
   - Framework Preset: `Other`
   - Root Directory: `./` (leave default)
   - Build Command: (leave empty)
   - Output Directory: `frontend`

3. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes
   - **Copy your frontend URL** (e.g., `https://zp-school-redgaon.vercel.app`)

---

### Step 4: Update CORS (1 minute)

1. **Go back to Render Dashboard**
2. Select your backend service
3. Go to "Environment" tab
4. Update `FRONTEND_URL` with your Vercel URL:
   ```
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
5. Click "Save Changes"
6. Service will auto-redeploy

---

## ✅ Done! Test Your App

1. Visit your Vercel URL
2. Click "Create Account" to sign up
3. Login with your credentials
4. Start using the system!

---

## 🐛 Troubleshooting

### Backend not responding?
- Render free tier spins down after 15 min
- First request may take 30-60 seconds
- Check Render logs for errors

### CORS errors?
- Verify `FRONTEND_URL` matches your Vercel URL exactly
- No trailing slash in URL
- Redeploy backend after changing

### Can't login?
- Check browser console (F12)
- Verify backend URL in `config.js`
- Test backend directly: `https://your-backend.onrender.com/`

---

## 📝 Important URLs

After deployment, save these:

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.onrender.com
- **Backend API**: https://your-backend.onrender.com/api

---

## 🔐 Security Notes

For production, consider:
1. Change `JWT_SECRET` to a strong random string
2. Update MongoDB password
3. Restrict MongoDB network access
4. Add rate limiting

---

## 💡 Tips

- **Free Tier**: Backend sleeps after 15 min of inactivity
- **First Load**: May take 30-60 seconds to wake up
- **Logs**: Check Render logs if issues occur
- **Updates**: Push to GitHub → Auto-deploys to Vercel

---

## 📞 Need Help?

1. Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guide
2. Review Render/Vercel logs
3. Test API endpoints with Postman
4. Verify all environment variables

---

**That's it! Your school management system is now live! 🎉**
