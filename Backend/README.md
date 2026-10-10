# PrepX Cloudinary Backend

This Express backend receives one image or video from your React frontend and uploads it to Cloudinary.

## 1. Requirements

- Node.js LTS installed
- A Cloudinary account and its Cloud name, API Key, and API Secret
- Your React frontend (Vite defaults to `http://localhost:5173`)

## 2. Install

Open a terminal inside this backend folder:

```bash
npm install
```

## 3. Configure credentials

Copy `.env.example` to a new file named `.env` and fill in the real values:

```dotenv
PORT=5001
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/prepx
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Do not commit `.env` or expose the API secret in frontend code.

`MONGODB_URI` should point to a running local MongoDB instance or your MongoDB Atlas
connection string. Keep Atlas credentials in this backend `.env` file only.

## 4. Run

Development mode (auto-restarts when files change):

```bash
npm run dev
```

Or:

```bash
npm start
```

Check `http://localhost:5001/api/health`. A successful MongoDB connection returns
HTTP 200 with `{"status":"ok","database":"connected"}`. If MongoDB is missing or
unavailable, the endpoint returns HTTP 503 and reports the database state.

## 5. Connect React

Upload endpoint: `POST http://localhost:5001/api/upload`

Use `FormData` with a field named exactly `file`:

```js
const formData = new FormData();
formData.append("file", selectedFile);

const response = await fetch("http://localhost:5001/api/upload", {
  method: "POST",
  body: formData
});
const data = await response.json();
if (!response.ok) throw new Error(data.message || "Upload failed");
console.log(data.url, data.publicId, data.resourceType);
```

Do not manually set the `Content-Type` header when sending `FormData`; the browser adds the multipart boundary.

Allowed types: JPG, PNG, WEBP, GIF, MP4, WEBM, MOV. Starting size limit: 25 MB. The API returns a secure URL, Cloudinary public ID, resource type, format, and byte size.

## Notes

- Files are uploaded to the Cloudinary folder `prepx`.
- Files are uploaded to Cloudinary. The auth API supports email/password sign-up and login.
- The MIME type check is a basic guard, not a full security inspection. Before production, add authentication, rate limits, stronger file validation, and appropriate upload limits.
