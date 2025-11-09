# 🚀 Scaling Setup Guide - Bull Queue + Socket.io Redis Adapter

## Overview

This guide explains how to set up the scaling infrastructure for your tutoring platform using:
- **Bull** - Job queue for AI report generation (asynchronous processing)
- **Redis (Upstash)** - Message broker for queue and Socket.io adapter
- **Socket.io Redis Adapter** - Enables horizontal scaling of WebSocket connections

---

## 📋 What We've Implemented

### 1. **AI Report Generation Queue**
- Reports are now generated asynchronously (non-blocking)
- API endpoints return immediately (~50ms instead of 30+ seconds)
- Automatic retries on failure (3 attempts with exponential backoff)
- Rate limiting (10 reports per minute to respect OpenAI limits)
- Progress tracking for real-time status updates

### 2. **Socket.io Redis Adapter**
- Enables multiple backend servers to share WebSocket connections
- Broadcasts chat messages across all server instances
- Required for horizontal scaling beyond 500 concurrent sessions

### 3. **Bull Board Dashboard**
- Real-time monitoring of queue jobs
- View job status, progress, and errors
- Retry failed jobs manually
- Available in development mode at `http://localhost:5000/admin/queues`

---

## 🔧 Setup Instructions

### Step 1: Create Upstash Redis Database (5 minutes)

1. Go to https://upstash.com and sign up (free, no credit card required)
2. Click **"Create Database"**
3. Settings:
   - **Name:** `tutoring-queue`
   - **Type:** Regional (faster than global)
   - **Region:** Choose closest to your backend (e.g., `us-east-1`)
   - **TLS:** Enabled (default)
4. Click **"Create"**

You'll get a connection URL like:
```
rediss://default:AbCd...XyZ@us1-example-12345.upstash.io:6379
```

**Upstash Free Tier:**
- ✅ 10,000 commands/day (enough for 3,000 reports + overhead)
- ✅ 256 MB storage
- ✅ Global edge network
- ✅ No credit card required

---

### Step 2: Add Redis URL to Environment Variables

#### For Local Development

Add to `backend/.env`:

```env
# Upstash Redis for Queue + Socket.io
REDIS_URL=rediss://default:AbCd...XyZ@us1-example-12345.upstash.io:6379
```

#### For Production (Netlify)

1. Go to your Netlify dashboard
2. **Site Settings** → **Environment Variables**
3. Add new variable:
   - **Key:** `REDIS_URL`
   - **Value:** `rediss://default:AbCd...XyZ@us1-example-12345.upstash.io:6379`
   - **Scopes:** Production, Deploy Previews

#### For Production (AWS App Runner)

Update your `apprunner-config.json`:

```json
{
  "InstanceConfiguration": {
    "RuntimeEnvironmentVariables": {
      "REDIS_URL": "rediss://default:AbCd...XyZ@us1-example-12345.upstash.io:6379",
      // ... other env vars
    }
  }
}
```

---

### Step 3: Verify Setup

Restart your backend server:

```bash
cd backend
npm run dev
```

You should see:
```
✅ Socket.io Redis adapter initialized - ready for horizontal scaling
📊 Queue dashboard available at http://localhost:5000/admin/queues
```

---

## 📊 How to Use the Queue System

### Generate Report (Async)

**Old behavior (synchronous):**
```bash
POST /api/reports/session/:id
→ Wait 30+ seconds
→ Get report
```

**New behavior (asynchronous):**
```bash
# 1. Start generation (returns immediately)
POST /api/reports/session/:id
→ Response in ~50ms:
{
  "success": true,
  "status": "queued",
  "jobId": "report-abc123",
  "message": "Report generation started. Check back in 30-60 seconds.",
  "statusUrl": "/api/reports/session/abc123/status"
}

# 2. Check status (poll every 2 seconds)
GET /api/reports/session/:id/status
→ Response:
{
  "success": true,
  "status": "active",  // or "waiting", "completed", "failed"
  "progress": 50,      // 0-100%
  "jobId": "report-abc123"
}

# 3. Get completed report
GET /api/reports/session/:id
→ Returns full report when status = "completed"
```

---

## 🎛️ Bull Board Dashboard

### Access the Dashboard

Visit: `http://localhost:5000/admin/queues` (development only)

### Features:

- **Jobs Overview:** See waiting, active, completed, and failed jobs
- **Job Details:** Click any job to see full details, logs, and errors
- **Retry Failed Jobs:** Manually retry jobs that failed
- **Progress Tracking:** Real-time progress updates (0-100%)
- **Queue Stats:** Throughput, processing time, failure rate

### Production Access:

For security, Bull Board is only enabled in development. For production monitoring:
1. Use Upstash Redis Console (view keys, commands)
2. Implement custom monitoring endpoint with authentication
3. Use APM tools (Datadog, New Relic, Sentry)

---

## 🔄 Horizontal Scaling (Multiple Backend Instances)

### When You Need This:

- 500+ concurrent Socket.io connections (chat sessions)
- High CPU usage on single backend instance
- Need zero-downtime deployments

### How It Works:

With Redis adapter, you can run 2+ backend instances:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Backend 1  │────▶│    Redis    │◀────│  Backend 2  │
│ (Instance)  │     │   (Upstash) │     │ (Instance)  │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    ▲                    │
      └────────────────────┴────────────────────┘
           Socket.io messages broadcast
                 across all instances
```

### Setup for AWS App Runner:

```json
{
  "AutoScalingConfiguration": {
    "MinSize": 2,    // Minimum 2 instances
    "MaxSize": 10,   // Scale up to 10 instances
    "TargetCPU": 70, // Scale when CPU > 70%
    "TargetMemory": 80
  }
}
```

---

## 📈 Monitoring & Alerts

### Key Metrics to Track:

1. **Queue Metrics:**
   - Jobs per minute
   - Average processing time
   - Failure rate
   - Queue backlog

2. **Socket.io Metrics:**
   - Active connections
   - Messages per second
   - Connection errors

3. **Cost Metrics:**
   - Redis commands/day (stay under 10k for free tier)
   - OpenAI API usage
   - Participant minutes (Daily.co)

### Upstash Console:

Monitor your Redis usage at: https://console.upstash.com

- View command count
- Check memory usage
- See connection stats
- Upgrade to paid plan when needed ($10/month for 100k commands/day)

---

## 🐛 Troubleshooting

### Issue: Queue jobs not processing

**Solution:**
1. Check `REDIS_URL` is set correctly
2. Verify Upstash database is active
3. Check backend logs for connection errors
4. Visit Bull Board dashboard to see job status

### Issue: Socket.io messages not broadcasting

**Solution:**
1. Verify Redis adapter is initialized (check logs)
2. Ensure `REDIS_URL` is configured
3. Check if multiple backend instances are running
4. Test with single instance first

### Issue: OpenAI rate limit errors

**Solution:**
1. Jobs will automatically retry (3 attempts)
2. Reduce queue concurrency in `reportQueue.js`:
   ```javascript
   reportQueue.process(3, async (job) => { // Changed from 5 to 3
   ```
3. Request OpenAI tier upgrade for higher limits
4. Switch to GPT-4o-mini (cheaper, higher limits)

### Issue: Redis connection timeout

**Solution:**
1. Check if Upstash database region matches backend region
2. Verify firewall allows outbound connections to Upstash
3. Try `redis://` instead of `rediss://` (without TLS) for testing
4. Check Upstash status page

---

## 💰 Cost Estimates

### Free Tier (Today):

| Service | Free Tier | Your Usage | Status |
|---------|-----------|------------|--------|
| **Upstash Redis** | 10k commands/day | ~6k commands/day | ✅ Free |
| **Bull Queue** | Included | N/A | ✅ Free |
| **Socket.io Adapter** | Included | N/A | ✅ Free |
| **Total** | **$0/month** | 3,000 sessions/day | ✅ Free |

### When to Upgrade:

Upgrade Upstash to paid ($10/month) when:
- \> 10,000 Redis commands/day
- \> 256 MB data stored
- Need longer data retention

---

## 🎯 Next Steps

1. ✅ **Deploy to staging** - Test queue with real OpenAI API
2. ✅ **Update frontend** - Add polling for report status
3. ✅ **Load test** - Simulate 100 concurrent report generations
4. ✅ **Monitor costs** - Track Redis commands and OpenAI usage
5. ✅ **Scale backend** - Add 2nd instance when concurrent > 500

---

## 📚 Additional Resources

- [Bull Documentation](https://github.com/OptimalBits/bull)
- [Bull Board UI](https://github.com/felixmosh/bull-board)
- [Socket.io Redis Adapter](https://socket.io/docs/v4/redis-adapter/)
- [Upstash Documentation](https://docs.upstash.com/)

---

## 🆘 Support

If you encounter issues:
1. Check backend logs for error messages
2. Visit Bull Board dashboard for queue status
3. Check Upstash console for Redis metrics
4. Review this guide's troubleshooting section

**Happy Scaling!** 🚀



