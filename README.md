# Finance Master — Update Pack

This update adds transaction editing to the existing starter while retaining its localStorage key (`finance-master-personal-v1`) and existing record schema.

## Important
- This build still stores data in the current browser's localStorage.
- Firebase Authentication and Firestore cloud sync are not configured by this file.
- Before replacing a deployed file, export a JSON backup from Settings & Backup.
- Do not use Vercel Drop for future source updates. Commit the updated `index.html` to the connected GitHub repository's `main` branch so Vercel can build the same project, assuming Git integration and production branch settings are correct.
- Upload this file as `index.html` at the repository root. Do not upload the ZIP as the website source.
