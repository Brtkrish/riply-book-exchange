# Riply 📚

An eco-friendly used-book marketplace that connects buyers and sellers, making it easier to give pre-loved books a second life.

## Overview

Riply is a full-stack web application designed around the idea of circular commerce. Users can browse and search for used books, list books for sale, manage their listings, and complete purchases through a streamlined checkout experience.

The application uses Supabase for authentication, database management, storage, and real-time updates.

## Features

### Buyer Features

- Browse and search used books
- Filter books by category, price, author, and condition
- Add books to cart
- Group cart items by seller
- View seller information
- Complete the checkout workflow
- Contact sellers through available contact options

### Seller Features

- Create and manage book listings
- Upload book images
- Add price, category, description, and condition
- Manage listings through a personal dashboard
- Seller-specific order summaries

### Authentication & Backend

- User authentication with Supabase Auth
- Google OAuth authentication
- Role-based buyer and seller functionality
- Real-time database updates
- Supabase Storage for book images
- Relational data model for users, listings, and orders

## Tech Stack

### Frontend

- React
- TypeScript
- Tailwind CSS

### Backend & Database

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage

### Other

- Git
- GitHub
- Vercel

## Application Flow

```text
User
 │
 ├── Browse Books ──► Search / Filter
 │
 ├── Buy ───────────► Cart ──► Checkout
 │
 └── Sell ──────────► Create Listing
                         │
                         ▼
                    Supabase Database
                         │
                         ▼
                   Buyer / Seller
```

## Project Structure

```text
Riply/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── context/
│   ├── utils/
│   ├── services/
│   └── assets/
│
├── public/
├── supabase/
├── package.json
└── README.md
```

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/Brtkrish/riply-book-exchange.git
cd riply
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key
```

### Run the Development Server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

## Deployment

The frontend can be deployed using Vercel, while Supabase provides the authentication, database, and storage infrastructure.

## Sustainability

Riply promotes the reuse of books by creating a marketplace for pre-owned books. By extending the lifecycle of books, the platform encourages sustainable consumption and helps make books more affordable.

## Live Demo

https://riply.vercel.app/

## Author

**S Bharath Krishna**

Computer Science Engineering  
Government Model Engineering College, Kochi

GitHub: https://github.com/Brtkrish
