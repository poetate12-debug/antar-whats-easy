# GELIS DELIVERY - Deployment & Post-Launch Guide

## 📦 Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Lovable Cloud (Supabase)
- **PWA**: Service Worker + Manifest

---

## 🚀 Deployment Options

### Option 1: Lovable Native Deploy (Recommended)
1. Click **Publish** button (top-right corner)
2. Click **Update** to deploy changes
3. Your app will be available at: `your-project.lovable.app`

### Option 2: Custom Domain
1. Go to **Settings > Domains**
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate is auto-provisioned

### Option 3: Self-Hosting via GitHub
1. Connect GitHub in **Settings > Connectors**
2. Clone the repository
3. Run `npm install && npm run build`
4. Deploy `dist/` folder to any static host (Vercel, Netlify, etc.)

---

## 🔐 Environment Variables

Required for production:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

---

## 📱 PWA Configuration

The app includes full PWA support:
- **Manifest**: `/public/manifest.json`
- **Service Worker**: `/public/sw.js`
- **Icons**: `/public/icons/`
- **Offline Page**: `/public/offline.html`

### Testing PWA Installation
1. Open app in Chrome/Edge
2. Click "Install" button in header (or browser prompt)
3. App installs as native-like experience

---

## 👥 User Roles & Access

| Role | Dashboard | Capabilities |
|------|-----------|--------------|
| Pelanggan | `/dashboard/pelanggan` | Order, track, rate driver |
| Mitra | `/dashboard/mitra` | Manage warung, menus, process orders |
| Driver | `/dashboard/driver` | Accept/reject orders, manage deliveries |
| Admin | `/dashboard/admin` | Approve users, manage all data, view setoran |

---

## 🔄 Post-Launch Updates

### Adding New Wilayah
1. Login as Admin
2. Use database tool to add to `wilayahs` table
3. Set `is_active = true` and appropriate `ongkir`

### Adding New Warung
1. Mitra registers via `/auth`
2. Admin approves in dashboard
3. Mitra can then add their warung & menus

### Updating Menus
- Mitra can manage via `/dashboard/mitra`
- Toggle `is_available` to show/hide items

---

## 📊 Database Tables Overview

| Table | Purpose |
|-------|---------|
| `wilayahs` | Delivery regions with ongkir rates |
| `warungs` | Restaurant/warung data |
| `menus` | Menu items per warung |
| `orders` | Customer orders |
| `profiles` | User profile data |
| `user_roles` | Role assignments (admin, mitra, driver, pelanggan) |
| `pending_registrations` | Registration queue for approval |
| `driver_assignments` | Order-to-driver assignments |
| `driver_ratings` | Customer ratings for drivers |
| `driver_stats` | Aggregated driver performance |
| `driver_setoran` | Driver commission/deposit records |

---

## 🛡️ Security Best Practices

1. **RLS Policies**: All tables have Row Level Security enabled
2. **Role-Based Access**: Functions check `has_role()` for authorization
3. **No Anonymous Signups**: All registrations require admin approval
4. **Sensitive Data**: Phone numbers stored with proper access controls

---

## 🐛 Troubleshooting

### Orders not showing?
- Check RLS policies on `orders` table
- Verify user authentication state

### PWA not installing?
- Ensure HTTPS in production
- Check manifest.json validity
- Clear browser cache

### Driver can't see assignments?
- Verify driver has `driver` role in `user_roles`
- Check `driver_status` table for online status

---

## 📞 Support Contacts

Configure these in:
- Footer component: `src/components/Footer.tsx`
- WhatsApp float: `src/components/FloatingWhatsApp.tsx`

---

## 🔧 Maintenance Tasks

### Weekly
- Review pending registrations
- Check driver setoran status
- Monitor order completion rates

### Monthly
- Review and update menu availability
- Check for inactive warungs
- Analyze popular items for recommendations

---

*Generated for GELIS DELIVERY - Session 4 Deployment Guide*
