# Monitoring and Observability


## Monitoring Stack

- **Frontend Monitoring:** Vercel Analytics (Core Web Vitals, page views)
- **Backend Monitoring:** Vercel Logs (API route performance, errors)
- **Error Tracking:** Sentry (error capture and alerting)
- **Performance Monitoring:** Vercel Analytics + Sentry Performance

## Key Metrics

**Frontend Metrics:**
- Core Web Vitals (LCP, FID, CLS)
- JavaScript errors (captured by Sentry)
- API response times (from frontend perspective)
- Page load times
- Search query performance

**Backend Metrics:**
- Request rate (requests per minute)
- Error rate (4xx, 5xx responses)
- Response time (p50, p95, p99)
- Database query performance
- API route execution time

**Business Metrics:**
- Profile views
- Search queries (top queries)
- Contact form submissions
- Profile claim rate
- User signups

