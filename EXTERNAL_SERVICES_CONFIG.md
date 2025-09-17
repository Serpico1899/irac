# 🌐 IRAC External Services Configuration Guide

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Production Ready Configuration  
**Project**: IRAC (Interactive Resource and Assessment Center)

---

## 📋 Overview

This document provides comprehensive configuration instructions for all external services required for IRAC production deployment. All services have been tested and validated for enterprise-grade operation.

### 🎯 **Required External Services**
1. **SMS Provider** (OTP & Notifications)
2. **Payment Gateway** (ZarinPal Integration)
3. **Email SMTP Service** (Transactional Emails)
4. **File Storage** (Media & Documents)
5. **Monitoring & Analytics**

---

## 🔧 Configuration Instructions

### 1. 📱 SMS Provider Configuration

#### **Recommended Provider: Kavenegar (Iran)**
```bash
# Backend .env configuration
SMS_PROVIDER=kavenegar
KAVENEGAR_API_KEY=your_kavenegar_api_key_here
KAVENEGAR_SENDER=your_sender_number
SMS_TIMEOUT=30000
```

#### **Alternative: SMS.ir**
```bash
# Backend .env configuration
SMS_PROVIDER=smsir
SMSIR_API_KEY=your_smsir_api_key_here
SMSIR_SECRET_KEY=your_secret_key_here
SMSIR_LINE_NUMBER=your_line_number
```

#### **International: Twilio**
```bash
# Backend .env configuration
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

#### **Implementation Notes:**
- OTP expiration: 5 minutes
- Rate limiting: 3 attempts per 15 minutes
- Backup provider failover implemented
- Cost optimization: ~$0.05 per SMS

### 2. 💳 Payment Gateway Configuration

#### **Primary: ZarinPal (Iran)**
```bash
# Backend .env configuration
PAYMENT_GATEWAY=zarinpal
ZARINPAL_MERCHANT_ID=your_zarinpal_merchant_id
ZARINPAL_MODE=production  # or 'sandbox' for testing
ZARINPAL_CALLBACK_URL=https://yourdomain.com/payment/callback
ZARINPAL_TIMEOUT=600000
```

#### **International: Stripe**
```bash
# Backend .env configuration
PAYMENT_GATEWAY=stripe
STRIPE_PUBLIC_KEY=pk_live_your_public_key
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### **Payment Features Implemented:**
- ✅ One-time payments
- ✅ Subscription billing
- ✅ Refund processing
- ✅ Webhook handling
- ✅ Currency conversion
- ✅ Transaction logging

### 3. 📧 Email SMTP Configuration

#### **Recommended: Mailgun**
```bash
# Backend .env configuration
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=postmaster@mg.yourdomain.com
SMTP_PASSWORD=your_mailgun_password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=IRAC Platform
```

#### **Alternative: AWS SES**
```bash
# Backend .env configuration
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your_aws_access_key
SMTP_PASSWORD=your_smtp_password
EMAIL_FROM=noreply@yourdomain.com
```

#### **Local Development: MailHog**
```bash
# Development only
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=""
SMTP_PASSWORD=""
```

#### **Email Templates Configured:**
- Welcome emails
- OTP verification
- Password reset
- Course enrollment confirmations
- Payment receipts
- System notifications

### 4. 📁 File Storage Configuration

#### **Production: AWS S3**
```bash
# Backend .env configuration
FILE_STORAGE=s3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=irac-production-files
S3_PUBLIC_URL=https://your-bucket.s3.amazonaws.com
MAX_FILE_SIZE=50MB
```

#### **Alternative: Arvan Cloud (Iran)**
```bash
# Backend .env configuration
FILE_STORAGE=arvan
ARVAN_ACCESS_KEY=your_arvan_access_key
ARVAN_SECRET_KEY=your_arvan_secret_key
ARVAN_ENDPOINT=https://s3.ir-thr-at1.arvanstorage.com
ARVAN_BUCKET=irac-files
```

#### **Local Development**
```bash
# Development only
FILE_STORAGE=local
LOCAL_UPLOAD_PATH=./uploads
LOCAL_PUBLIC_URL=http://localhost:1405/files
```

#### **File Handling Features:**
- ✅ Image optimization
- ✅ Video compression
- ✅ PDF processing
- ✅ Virus scanning
- ✅ CDN integration
- ✅ Backup storage

### 5. 📊 Monitoring & Analytics

#### **Application Monitoring: Sentry**
```bash
# Backend .env configuration
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
```

#### **Analytics: Google Analytics 4**
```bash
# Frontend .env configuration
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

#### **Performance Monitoring: New Relic**
```bash
# Backend .env configuration
NEW_RELIC_LICENSE_KEY=your_license_key
NEW_RELIC_APP_NAME=IRAC-Production
NEW_RELIC_LOG_LEVEL=info
```

---

## 🔐 Security Configuration

### SSL/TLS Certificates
```bash
# Backend .env configuration
SSL_CERT_PATH=/path/to/your/cert.pem
SSL_KEY_PATH=/path/to/your/private-key.pem
SSL_CA_PATH=/path/to/your/ca-bundle.pem
FORCE_HTTPS=true
```

### JWT Configuration
```bash
# Backend .env configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

### Rate Limiting
```bash
# Backend .env configuration
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW=900000  # 15 minutes
RATE_LIMIT_MAX=100        # requests per window
```

---

## 🚀 Production Deployment Steps

### Step 1: Environment Setup
```bash
# Copy environment templates
cp .env.backend.example .env.backend
cp .env.frontend.example .env.frontend

# Edit configuration files
nano .env.backend
nano .env.frontend
```

### Step 2: Service Registration
1. **SMS Provider**: Register at chosen provider, obtain API keys
2. **Payment Gateway**: Complete merchant verification, get credentials
3. **Email Service**: Set up domain authentication, configure DKIM/SPF
4. **File Storage**: Create buckets, configure IAM permissions
5. **Monitoring**: Set up projects, install tracking codes

### Step 3: DNS Configuration
```bash
# Required DNS records
A     yourdomain.com          -> your_server_ip
CNAME www.yourdomain.com      -> yourdomain.com
CNAME api.yourdomain.com      -> yourdomain.com
TXT   yourdomain.com          -> "v=spf1 include:mailgun.org ~all"
CNAME mail._domainkey         -> mail.yourdomain.com.mailgun.org
```

### Step 4: SSL Certificate Setup
```bash
# Using Certbot (Let's Encrypt)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Or upload purchased certificates
sudo cp yourdomain.com.crt /etc/ssl/certs/
sudo cp yourdomain.com.key /etc/ssl/private/
```

---

## 📋 Configuration Checklist

### Pre-Deployment Checklist
- [ ] SMS provider API key configured and tested
- [ ] Payment gateway merchant account verified
- [ ] Email SMTP credentials configured
- [ ] File storage buckets created and accessible
- [ ] SSL certificates installed and valid
- [ ] DNS records properly configured
- [ ] Monitoring services set up
- [ ] Backup systems configured
- [ ] Security headers configured
- [ ] Environment variables secured (600 permissions)

### Testing Checklist
- [ ] SMS delivery test successful
- [ ] Payment flow test completed
- [ ] Email delivery confirmed
- [ ] File upload/download working
- [ ] SSL certificate valid
- [ ] Monitoring alerts configured
- [ ] Error logging functional
- [ ] Performance metrics collecting

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### SMS Not Sending
```bash
# Check API key validity
curl -X POST "https://api.kavenegar.com/v1/YOUR_API_KEY/sms/send.json" \
  -d "receptor=YOUR_PHONE" -d "message=Test"

# Verify rate limits not exceeded
# Check SMS provider dashboard
```

#### Payment Failures
```bash
# Verify ZarinPal configuration
curl -X POST "https://api.zarinpal.com/pg/v4/payment/request.json" \
  -H "Content-Type: application/json" \
  -d '{"merchant_id":"YOUR_MERCHANT_ID","amount":1000,"description":"Test"}'
```

#### Email Delivery Issues
```bash
# Test SMTP connection
telnet smtp.mailgun.org 587

# Check DNS records
dig TXT yourdomain.com
dig CNAME mail._domainkey.yourdomain.com
```

#### File Upload Errors
```bash
# Check S3 permissions
aws s3 ls s3://your-bucket-name --profile your-profile

# Verify CORS configuration
aws s3api get-bucket-cors --bucket your-bucket-name
```

---

## 📊 Cost Estimation

### Monthly Operating Costs (Production)

| Service | Provider | Estimated Cost |
|---------|----------|---------------|
| SMS (1000/month) | Kavenegar | $50 |
| Payment Processing | ZarinPal | 1.5% of transactions |
| Email (10k/month) | Mailgun | $35 |
| File Storage (100GB) | AWS S3 | $25 |
| SSL Certificate | Let's Encrypt | Free |
| Monitoring | Sentry | $26 |
| **Total Base Cost** | | **~$136/month** |

*Note: Payment processing fees are transaction-based*

---

## 🆘 Support & Documentation

### Service Documentation Links
- **Kavenegar SMS**: https://kavenegar.com/rest.html
- **ZarinPal Payment**: https://docs.zarinpal.com/
- **Mailgun Email**: https://documentation.mailgun.com/
- **AWS S3**: https://docs.aws.amazon.com/s3/
- **Sentry Monitoring**: https://docs.sentry.io/

### Emergency Contacts
- **SMS Issues**: Check provider status page
- **Payment Issues**: Contact gateway support
- **Email Issues**: Verify SMTP settings
- **Storage Issues**: Check service status

---

## 📝 Configuration Templates

### Complete .env.backend Template
```bash
# Server Configuration
NODE_ENV=production
PORT=1405
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb://localhost:27017/irac_production

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# SMS Configuration
SMS_PROVIDER=kavenegar
KAVENEGAR_API_KEY=your_kavenegar_api_key_here
KAVENEGAR_SENDER=your_sender_number

# Payment Configuration
PAYMENT_GATEWAY=zarinpal
ZARINPAL_MERCHANT_ID=your_zarinpal_merchant_id
ZARINPAL_MODE=production

# Email Configuration
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=postmaster@mg.yourdomain.com
SMTP_PASSWORD=your_mailgun_password
EMAIL_FROM=noreply@yourdomain.com

# File Storage
FILE_STORAGE=s3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=irac-production-files

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Complete .env.frontend Template
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
LESAN_URL=https://api.yourdomain.com/lesan

# Analytics
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Environment
NODE_ENV=production
```

---

## ✅ Post-Configuration Validation

After completing all configurations, run the production readiness check:

```bash
./production-readiness-check.sh
```

This will validate all external service configurations and provide a comprehensive report.

---

**🎯 Next Steps**: Once all services are configured, proceed with production deployment using `./deploy-production.sh`

**📞 Support**: For configuration assistance, reference this document and check service provider documentation.

---

*End of External Services Configuration Guide*
*Document prepared for IRAC Production Deployment*