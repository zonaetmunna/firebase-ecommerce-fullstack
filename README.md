# Firebase Commerce - Full Stack E-commerce Application

A complete e-commerce solution built with Next.js 13, Firebase, Redux Toolkit, TypeScript, and Tailwind CSS. Features a comprehensive admin dashboard with role-based access control, inventory management, and real-time analytics.

## 🚀 Features

### User Features

- **Authentication**: Email/password, Google, and Facebook sign-in
- **Product Catalog**: Browse, search, and filter products
- **Shopping Cart**: Add to cart with persistence
- **Wishlist**: Save favorite items
- **Order Management**: Place and track orders
- **User Profile**: Manage personal information

### Admin Features

- **Dashboard**: Real-time analytics and insights
- **Product Management**: Full CRUD operations
- **Category Management**: Organize products
- **Order Management**: Track and update orders
- **User Management**: Manage users and roles
- **Inventory Tracking**: Monitor stock levels
- **Notifications**: System alerts and updates
- **Global Search**: Search across all entities
- **Data Export**: Export data in various formats
- **Audit Logs**: Track system changes
- **System Settings**: Configure application settings

## 🛠️ Tech Stack

- **Frontend**: Next.js 13 (App Router), React, TypeScript
- **State Management**: Redux Toolkit with Redux Persist
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Styling**: Tailwind CSS
- **Icons**: React Icons
- **Forms**: React Hook Form

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/firebase-commerce.git
   cd firebase-commerce
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up Firebase**

   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password, Google, Facebook)
   - Enable Firestore Database
   - Enable Storage
   - Copy your Firebase configuration

4. **Environment Configuration**

   Create a `.env.local` file in the root directory and add your Firebase configuration:

   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Application Configuration
   NEXT_PUBLIC_APP_NAME="Firebase Commerce"
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Admin Configuration
   ADMIN_EMAIL=admin@firebasecommerce.com
   ADMIN_PASSWORD=admin123

   # Environment
   NODE_ENV=development
   ```

   > **Important**: Replace all `your_*_here` values with your actual Firebase project configuration values.

5. **Configure Firestore Security Rules**

   In your Firebase Console, go to Firestore Database → Rules and use these security rules:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read and write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         allow read: if request.auth != null &&
           resource.data.role == 'admin' &&
           request.auth.token.role == 'admin';
       }

       // Public read access to products and categories
       match /products/{productId} {
         allow read: if true;
         allow write: if request.auth != null && request.auth.token.role == 'admin';
       }

       match /categories/{categoryId} {
         allow read: if true;
         allow write: if request.auth != null && request.auth.token.role == 'admin';
       }

       // Orders can be read by the user who created them or admin
       match /orders/{orderId} {
         allow read: if request.auth != null &&
           (request.auth.uid == resource.data.userId ||
            request.auth.token.role == 'admin');
         allow write: if request.auth != null;
       }

       // Admin-only collections
       match /notifications/{notificationId} {
         allow read, write: if request.auth != null && request.auth.token.role == 'admin';
       }

       match /settings/{settingId} {
         allow read, write: if request.auth != null && request.auth.token.role == 'admin';
       }
     }
   }
   ```

6. **Seed the database**

   ```bash
   npm run seed
   ```

7. **Start the development server**

   ```bash
   npm run dev
   ```

8. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Admin Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## 🔐 Admin Access

After running the seed script, you can access the admin dashboard with:

- **Email**: admin@firebasecommerce.com
- **Password**: admin123

## 📁 Project Structure

```
firebase-commerce/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Admin dashboard pages
│   │   ├── _components/        # Shared components
│   │   └── layout.tsx          # Root layout
│   ├── features/               # Redux slices
│   │   ├── admin/              # Admin slice
│   │   ├── user/               # User/Auth slice
│   │   ├── product/            # Product slice
│   │   ├── category/           # Category slice
│   │   ├── order/              # Order slice
│   │   ├── cart/               # Cart slice
│   │   └── wishlist/           # Wishlist slice
│   ├── firebase/               # Firebase configuration
│   │   └── firebase.config.ts  # Firebase config only
│   └── type.d.ts               # TypeScript definitions
├── scripts/
│   └── seed.ts                 # Database seeding script
└── README.md
```

## 🔧 Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Seed database with sample data
npm run seed
```

## 🏗️ Architecture

### State Management

- **Redux Toolkit**: Centralized state management
- **Redux Persist**: State persistence across sessions
- **Async Thunks**: Handle Firebase operations
- **Slice Pattern**: Modular state organization

### Firebase Integration

- **Firestore**: NoSQL database for all data
- **Authentication**: Multi-provider authentication
- **Storage**: File uploads and management
- **Security Rules**: Data access control

### Component Architecture

- **App Router**: Next.js 13 app directory structure
- **Server Components**: Optimized server-side rendering
- **Client Components**: Interactive UI components
- **Protected Routes**: Role-based access control

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

3. Initialize Firebase:

   ```bash
   firebase init
   ```

4. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

### Environment Variables for Production

Update your `.env.local` file with production Firebase configuration and deploy environment variables to your hosting platform.

## 🔒 Security

- **Firestore Security Rules**: Implement proper data access rules
- **Authentication**: Role-based access control
- **Input Validation**: Client and server-side validation
- **HTTPS**: Secure data transmission
- **Environment Variables**: Secure configuration management

## 📈 Features Roadmap

- [ ] Payment Integration (Stripe/PayPal)
- [ ] Email Notifications
- [ ] Advanced Analytics
- [ ] Multi-language Support
- [ ] PWA Features
- [ ] Mobile App (React Native)
- [ ] AI-powered Recommendations
- [ ] Advanced Search with Filters
- [ ] Bulk Operations
- [ ] API Documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Next.js team for the amazing framework
- Redux Toolkit for state management
- Tailwind CSS for styling
- React Icons for beautiful icons

## 📧 Contact

For questions or support, please contact:

- Email: admin@firebasecommerce.com
- GitHub: [Your GitHub Profile](https://github.com/yourusername)

---

**Made with ❤️ using Next.js, Firebase, and Redux Toolkit**
