# 🚀 IRAC Website Deployment Guide

**Version**: 1.0  
**Last Updated**: December 2024  
**Project Status**: Production Ready  

---

## 📋 **DEPLOYMENT OVERVIEW**

This guide covers the complete deployment process for the IRAC website, from development to production. The application is built with Next.js 15 and is ready for static generation deployment.

### **Deployment Options**
- ✅ **Recommended**: Vercel (optimized for Next.js)
- ✅ **Alternative**: Netlify (static hosting)
- ✅ **Enterprise**: AWS/Google Cloud (containerized)
- ✅ **Self-hosted**: Docker + nginx

---

## 🔧 **PREREQUISITES**

### **System Requirements**
- Node.js 18+ 
- pnpm 8+
- Git
- Domain name (recommended: `irac.ir` or similar)

### **Accounts Needed**
- [ ] Hosting platform account (Vercel/Netlify)
- [ ] Google Analytics account (for tracking)
- [ ] Domain registrar access
- [ ] SSL certificate provider (usually included with hosting)

---

## ⚙️ **ENVIRONMENT CONFIGURATION**

### **Production Environment Variables**

Create a `.env.production` file with the following variables:

```bash
# ============================================
# PRODUCTION ENVIRONMENT VARIABLES
# ============================================

# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://irac.ir

# API Configuration (when backend is ready)
LESAN_API_URL=https://api.irac.ir/lesan
NEXT_PUBLIC_LESAN_API_URL=https://api.irac.ir/lesan

# Analytics & Tracking
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_VERIFICATION=your-google-verification-code

# Security
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://irac.ir

# Payment Gateways (when implemented)
ZARINPAL_MERCHANT_ID=your-zarinpal-merchant-id
ZARINPAL_SANDBOX=false

# Email Service (when implemented)  
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@irac.ir
SMTP_PASS=your-email-password

# Database (when backend is ready)
DATABASE_URL=your-production-database-url

# File Storage (when needed)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key  
AWS_S3_BUCKET=irac-production-assets
AWS_REGION=us-east-1

# Monitoring & Error Tracking
SENTRY_DSN=your-sentry-dsn-for-error-tracking
```

### **Platform-Specific Configuration**

#### **For Vercel Deployment**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/((?!api/).*)$",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NEXT_PUBLIC_GA_ID": "@ga-id",
    "NEXT_PUBLIC_APP_URL": "https://irac.ir"
  }
}
```

#### **For Netlify Deployment**
Create `netlify.toml`:
```toml
[build]
  command = "cd front && pnpm build && pnpm export"
  publish = "front/out"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

## 🏗️ **BUILD PROCESS**

### **Pre-Deployment Checklist**
- [ ] All environment variables configured
- [ ] Build passes locally (`pnpm build`)
- [ ] All tests passing
- [ ] Performance audit completed
- [ ] SEO audit completed
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing completed

### **Local Build Test**
```bash
# Navigate to project directory
cd irac/front

# Install dependencies
pnpm install

# Run build
pnpm build

# Test production build locally
pnpm start
```

### **Production Build Commands**
```bash
# For static export (recommended)
cd front
pnpm build
pnpm export

# For server-side deployment
cd front  
pnpm build
pnpm start
```

---

## 🌐 **HOSTING DEPLOYMENT**

### **Option 1: Vercel Deployment (Recommended)**

#### **Automatic Deployment via Git**
1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Import your Git repository
   - Select the `front` folder as root directory

2. **Configure Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

3. **Environment Variables**:
   - Add all production environment variables in Vercel dashboard
   - Ensure sensitive keys are marked as secret

4. **Domain Configuration**:
   - Add custom domain in Vercel dashboard
   - Configure DNS records as instructed

#### **Manual Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
cd front
vercel --prod
```

### **Option 2: Netlify Deployment**

#### **Via Git Integration**
1. **Connect Repository**:
   - Go to [netlify.com](https://netlify.com)
   - Connect your Git repository
   - Set base directory to `front`

2. **Build Configuration**:
   - Build command: `pnpm build && pnpm export`
   - Publish directory: `out`
   - Production branch: `main`

3. **Environment Variables**:
   - Add variables in Netlify dashboard
   - Deploy settings → Environment variables

#### **Manual Deployment**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build for production
cd front
pnpm build && pnpm export

# Deploy to Netlify
netlify deploy --prod --dir=out
```

### **Option 3: AWS/Docker Deployment**

#### **Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY front/package*.json ./
COPY front/pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY front/ .

# Build application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start application
CMD ["pnpm", "start"]
```

#### **Docker Compose (with nginx)**
```yaml
version: '3.8'
services:
  irac-frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - irac-frontend
    restart: unless-stopped
```

---

## 🔒 **SSL & SECURITY SETUP**

### **Automatic SSL (Recommended)**
Most hosting providers (Vercel, Netlify) provide automatic SSL certificates:
- Enable HTTPS redirect
- Configure HSTS headers
- Ensure all resources load over HTTPS

### **Manual SSL Configuration**
For self-hosted deployments:

1. **Obtain SSL Certificate**:
   ```bash
   # Using Let's Encrypt
   sudo certbot --nginx -d irac.ir -d www.irac.ir
   ```

2. **Nginx SSL Configuration**:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name irac.ir www.irac.ir;
       
       ssl_certificate /etc/letsencrypt/live/irac.ir/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/irac.ir/privkey.pem;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### **Security Headers**
Add to `next.config.ts`:
```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ],
      },
    ]
  },
}
```

---

## 🔍 **ANALYTICS SETUP**

### **Google Analytics 4 Configuration**

1. **Create GA4 Property**:
   - Go to [analytics.google.com](https://analytics.google.com)
   - Create new property for irac.ir
   - Copy Measurement ID (G-XXXXXXXXXX)

2. **Configure Goals**:
   - Course Enrollment
   - Workshop Reservation  
   - Contact Form Submission
   - Newsletter Signup
   - User Registration

3. **Enhanced E-commerce**:
   ```javascript
   // Already implemented in the codebase
   gtag('event', 'purchase', {
     transaction_id: 'ORDER123',
     value: 250000,
     currency: 'IRR',
     items: [{
       item_id: 'course-001',
       item_name: 'Islamic Architecture Course',
       category: 'education',
       quantity: 1,
       price: 250000
     }]
   });
   ```

### **Google Search Console Setup**

1. **Add Property**: https://irac.ir
2. **Verify Ownership**: HTML tag method
3. **Submit Sitemap**: https://irac.ir/sitemap.xml
4. **Monitor Performance**: Track search rankings and clicks

---

## 🚀 **PERFORMANCE OPTIMIZATION**

### **Build Optimization**
```bash
# Analyze bundle size
cd front
pnpm build
pnpm analyze

# Check for unused dependencies
pnpm depcheck

# Optimize images
pnpm next-optimized-images
```

### **CDN Configuration**
For static assets, configure CDN:
- Images: Optimize and serve via CDN
- Fonts: Serve from Google Fonts or local CDN
- JavaScript/CSS: Enable gzip compression

### **Performance Monitoring**
```javascript
// Core Web Vitals tracking (already implemented)
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## 📊 **MONITORING & MAINTENANCE**

### **Health Check Endpoints**
Add to your deployment:
```typescript
// pages/api/health.ts
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version
  });
}
```

### **Error Monitoring**
Recommended services:
- **Sentry**: For error tracking and performance monitoring
- **LogRocket**: For session replay and debugging
- **New Relic**: For application performance monitoring

### **Backup Strategy**
1. **Code Repository**: Ensure Git repository has proper branches
2. **User Data**: Regular database backups (when backend is implemented)
3. **Assets**: Backup uploaded images and media files
4. **Environment Variables**: Secure backup of production settings

### **Update Process**
```bash
# Regular update workflow
git pull origin main
cd front
pnpm install
pnpm build
# Deploy using your chosen method
```

---

## 🔧 **TROUBLESHOOTING**

### **Common Build Issues**

**Issue**: Next.js build fails with memory error
```bash
# Solution: Increase memory limit
export NODE_OPTIONS="--max_old_space_size=4096"
pnpm build
```

**Issue**: TypeScript errors during build
```bash
# Solution: Run type check
pnpm tsc --noEmit
# Fix any type errors and rebuild
```

**Issue**: Missing environment variables
```bash
# Solution: Verify all required env vars are set
printenv | grep NEXT_PUBLIC
```

### **Runtime Issues**

**Issue**: 404 errors on page refresh
- **Solution**: Configure proper redirects in hosting platform
- For Nginx: Add try_files directive
- For Apache: Configure .htaccess

**Issue**: Images not loading
- **Solution**: Check image optimization settings
- Verify image paths and CDN configuration

**Issue**: Slow page loads
- **Solution**: Run Lighthouse audit
- Check bundle analyzer for large dependencies
- Implement code splitting

### **SEO Issues**

**Issue**: Pages not indexed by search engines
- **Solution**: Submit sitemap to Google Search Console
- Verify robots.txt allows crawling
- Check meta tags and structured data

---

## 📋 **POST-DEPLOYMENT CHECKLIST**

### **Immediate Actions**
- [ ] Verify all pages load correctly
- [ ] Test mobile responsiveness
- [ ] Check all forms are working
- [ ] Verify analytics tracking
- [ ] Test language switching (fa/en)
- [ ] Confirm SSL certificate is working
- [ ] Test shopping cart functionality
- [ ] Verify user registration/login
- [ ] Check admin panel access

### **Within 24 Hours**
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify email notifications (when implemented)
- [ ] Test payment processing (when implemented)
- [ ] Monitor analytics data
- [ ] Check search engine indexing
- [ ] Verify CDN is working properly
- [ ] Test backup procedures

### **Within One Week**
- [ ] Review user feedback
- [ ] Analyze performance data
- [ ] Check conversion rates
- [ ] Monitor server resources
- [ ] Review security logs
- [ ] Update documentation
- [ ] Plan first optimization cycle

---

## 📞 **SUPPORT & MAINTENANCE**

### **Ongoing Maintenance Schedule**
- **Daily**: Monitor error logs and performance
- **Weekly**: Review analytics and user feedback
- **Monthly**: Security updates and dependency updates
- **Quarterly**: Performance optimization and feature updates

### **Emergency Contacts**
- **Development Team**: [contact-info]
- **Hosting Support**: Platform-specific support channels
- **Domain Registrar**: DNS and domain issues
- **SSL Provider**: Certificate renewal and issues

### **Documentation Links**
- **Next.js Documentation**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vercel Deployment**: https://vercel.com/docs
- **Google Analytics**: https://support.google.com/analytics

---

## 🎯 **SUCCESS METRICS**

### **Technical Metrics to Monitor**
- **Page Load Speed**: < 3 seconds
- **Core Web Vitals**: All metrics in "Good" range
- **Uptime**: > 99.9%
- **Error Rate**: < 1%
- **Mobile Performance Score**: > 90

### **Business Metrics to Track**
- **Conversion Rate**: Course enrollments and workshop reservations
- **User Engagement**: Time on site, pages per session
- **International Reach**: Traffic from different countries
- **Search Rankings**: Organic search performance
- **User Satisfaction**: Contact form feedback

---

**🚀 DEPLOYMENT COMPLETE - WELCOME TO PRODUCTION! 🎉**

*Your IRAC website is now live and ready to serve users worldwide with a fast, secure, and optimized experience.*

---

*Last Updated: December 2024*