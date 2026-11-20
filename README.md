# MeNou — Frontend

**MeNou** is a smart recipe recommendation and kitchen inventory management web application built with **React** and **Vite**. It allows users to track their available ingredients, receive expiration alerts, discover recipes tailored to what they already have in their kitchen, and share their own recipes with the community.

---

## Features

- **User Authentication & Profile:** Secure login/registration and personal user profile management.
- **My Kitchen (Inventory Management):** Add, organize by category, and track ingredient quantities and expiration dates with automated alert banners.
- **Smart Recipe Feed (Home):** Browse and discover recipes with search, filtering, and star ratings.
- **Recipe Details & Creation:** View step-by-step instructions, required ingredients, and publish new recipes.
- **Notifications:** Real-time alerts for expiring ingredients and platform updates.

---

## Tech Stack

- **Framework:** React (Vite)
- **Routing:** React Router (`AppRouter`)
- **State Management:** React Context API & Custom Hooks
- **Styling:** Custom CSS (`index.css`)
- **HTTP Client:** Custom REST API integration (`src/api/`)

---

## Project Structure

    src/
    ├── api/          # REST API client & service endpoints (auth, kitchen, profile, recipes)
    ├── components/   # Reusable UI components (Cards, Modals, Banners, Navigation)
    ├── context/      # Global React state providers
    ├── hooks/        # Custom React hooks
    ├── pages/        # Main application views (Home, Login, MyKitchen, PostRecipe, Profile, RecipeDetails)
    ├── router/       # Application routing configuration
    └── utils/        # Constants, formatters, and input validators

---

## Getting Started (Local Setup)

1. **Clone the repository:**

       git clone [https://github.com/fanitheo/MeNou---Frontend.git](https://github.com/fanitheo/MeNou---Frontend.git)
       cd MeNou---Frontend

2. **Install dependencies:**

       npm install

3. **Configure environment variables:**
   Create a `.env` file in the root directory and set your backend API URL:

       VITE_API_URL=http://localhost:8677

4. **Run the development server:**

       npm run dev
