# Firebase Commerce - Complete Setup Guide

This guide will walk you through setting up the complete Firebase Commerce project from scratch.

## 🚀 Quick Start

1. **Clone and Install**

   ```bash
   git clone <repository-url>
   cd firebase-commerce
   npm install
   ```

2. **Set up Firebase**
   - Follow the [Firebase Setup](#firebase-setup) section below
   - Configure your `.env.local` file
   - Run the seed script
   - Start the development server

## 📋 Prerequisites

- Node.js 16.x or higher
- npm, yarn, or pnpm
- Firebase account (free tier is sufficient)
- Git

## 🔥 Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `firebase-commerce` (or your preferred name)
4. Enable/disable Google Analytics (optional)
5. Wait for project creation

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: Enable
   - **Google**: Enable (configure OAuth consent screen)
   - **Facebook**: Enable (optional, requires Facebook app)

### Step 3: Enable Firestore Database

1. Go to **Firestore Database** > **Create database**
2. Choose **Start in test mode** (we'll add security rules later)
3. Select your preferred location
4. Click "Done"

### Step 4: Enable Storage

1. Go to **Storage** > **Get started**
2. Choose **Start in test mode**
3. Select the same location as Firestore
4. Click "Done"

### Step 5: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click **Web** icon (</>) to add a web app
4. Enter app name: `firebase-commerce`
5. Copy the Firebase config object

### Step 6: Configure Environment Variables

1. Copy `env.template` to `.env.local`:

   ```bash
   cp env.template .env.local
   ```

2. Update `.env.local` with your Firebase config:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

## 🔐 Security Rules Setup

### Step 1: Firestore Security Rules

1. In Firebase Console, go to **Firestore Database** > **Rules**
2. Copy the content from `firestore.rules` file in this project
3. Paste it into the Firebase rules editor
4. Click **Publish**

### Step 2: Storage Security Rules

1. Go to **Storage** > **Rules**
2. Copy the Storage rules from the comment section in `firestore.rules`
3. Paste and publish

## 🌱 Database Seeding

The seed script will populate your Firestore database with sample data:

```bash
npm run seed
```

This will create:

- **Admin user**: admin@firebasecommerce.com / admin123
- **Sample categories**: Electronics, Clothing, Books, Home & Garden, Sports
- **Sample products**: iPhone, Samsung Galaxy, T-shirts, Books, Headphones
- **Sample orders**: Test order data
- **Notifications**: System notifications
- **Settings**: Default system settings

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev
```

Visit:

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

### Production Build

```bash
npm run build
npm run start
```

## 🔑 Admin Access

After seeding, you can access the admin dashboard with:

- **Email**: admin@firebasecommerce.com
- **Password**: admin123

## 📁 Project Structure

```
firebase-commerce/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Admin dashboard
│   │   ├── products/           # Product pages
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Homepage
│   ├── components/             # Reusable components
│   ├── features/               # Redux slices
│   │   ├── admin/              # Admin functionality
│   │   ├── auth/               # Authentication
│   │   ├── product/            # Product management
│   │   ├── category/           # Category management
│   │   ├── order/              # Order management
│   │   ├── cart/               # Shopping cart
│   │   └── wishlist/           # Wishlist
│   ├── firebase/               # Firebase configuration
│   └── types.d.ts              # TypeScript definitions
├── scripts/
│   └── seed.ts                 # Database seeding script
├── firestore.rules             # Firestore security rules
├── env.template                # Environment variables template
└── README.md                   # Project documentation
```

## 🚀 Deployment

### Firebase Hosting

1. Install Firebase CLI:

   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:

   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:

   ```bash
   firebase init
   ```

   - Select **Hosting**
   - Choose your existing project
   - Set public directory to `out`
   - Configure as single-page app: **Yes**
   - Set up automatic builds and deploys with GitHub: **Optional**

4. Update `next.config.js` for static export:

   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: "export",
     trailingSlash: true,
     images: {
       unoptimized: true,
     },
   };
   module.exports = nextConfig;
   ```

5. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

### Other Hosting Platforms

- **Vercel**: Connect your GitHub repository
- **Netlify**: Deploy from Git or drag-and-drop
- **AWS Amplify**: Connect repository and deploy

## 🛠️ Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Seed database
npm run seed

# Type check
npm run type-check
```

## 🔍 Troubleshooting

### Common Issues

1. **Firebase Auth Error**: Check your Firebase project configuration
2. **Firestore Permission Denied**: Ensure security rules are properly set
3. **Environment Variables**: Make sure all required variables are set
4. **Seed Script Fails**: Check Firebase configuration and internet connection

### Debug Steps

1. Check browser console for errors
2. Verify Firebase configuration in `.env.local`
3. Ensure Firebase services are enabled
4. Check Firebase Console for any errors or limits

## 🎯 Features Overview

### User Features

- ✅ User registration and authentication
- ✅ Product browsing and search
- ✅ Shopping cart functionality
- ✅ Wishlist management
- ✅ Order placement and tracking
- ✅ User profile management

### Admin Features

- ✅ Admin dashboard with analytics
- ✅ Product CRUD operations
- ✅ Category management
- ✅ Order management and tracking
- ✅ User management
- ✅ Inventory monitoring
- ✅ System notifications
- ✅ Global search functionality
- ✅ Data export capabilities
- ✅ System settings configuration

### Technical Features

- ✅ Redux state management with persistence
- ✅ Role-based access control
- ✅ Real-time data synchronization
- ✅ Responsive design
- ✅ TypeScript support
- ✅ SEO optimization
- ✅ Performance optimization

## 📈 Next Steps

1. **Customize Design**: Update colors, fonts, and layout
2. **Add Payment Processing**: Integrate Stripe or PayPal
3. **Email Notifications**: Set up transactional emails
4. **Advanced Analytics**: Add Google Analytics or custom analytics
5. **Mobile App**: Consider React Native implementation
6. **API Integration**: Add third-party service integrations
7. **Performance Optimization**: Add caching and performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues or questions:

- Check the troubleshooting section
- Review Firebase documentation
- Open an issue in the repository
- Contact: admin@firebasecommerce.com

---

**Happy coding! 🎉**
