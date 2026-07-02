# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

The easiest GitHub-based setup is:

1. Push this repository to GitHub.
2. Deploy the frontend from the repo root on Vercel.
3. Deploy the backend on a Node hosting provider such as Render, Railway, or Fly.io.
4. Set the frontend environment variables in Vercel:
	- `VITE_API_URL` = your backend URL ending in `/api`
	- `VITE_ML_API_URL` = your ML API URL
	- `VITE_PRICE_API_URL` = your price API URL
	- `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` if you use the Supabase chatbot flow
5. Set the backend environment variables on the backend host:
	- `MONGO_URI`
	- `JWT_SECRET`
	- `JWT_EXPIRES_IN`
	- `FRONTEND_URL` = your Vercel app URL

For local development, copy `.env.example` to `.env` and `backend/.env.example` to `backend/.env`.

Vercel config is already included in [vercel.json](vercel.json) for SPA routing.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
