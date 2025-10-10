# Cloudinary Setup Guide for GrubGate

This guide will help you set up Cloudinary for file uploads in the GrubGate backend.

## Prerequisites

1. A Cloudinary account (free tier available)
2. Node.js and npm installed
3. GrubGate backend project set up

## Step 1: Create Cloudinary Account

1. Go to [Cloudinary.com](https://cloudinary.com/)
2. Sign up for a free account
3. Once logged in, go to your Dashboard
4. Note down your **Cloud Name**, **API Key**, and **API Secret**

## Step 2: Install Required Dependencies

The required packages should already be installed, but if not, run:

```bash
cd backend
npm install cloudinary multer multer-storage-cloudinary
```

## Step 3: Environment Variables

Add the following environment variables to your `.env` file in the backend directory:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Important**: Replace the placeholder values with your actual Cloudinary credentials from Step 1.

## Step 4: Verify Configuration

The Cloudinary configuration is already set up in `src/config/cloudinary.js`. This file includes:

- **Logo Upload**: Optimized for restaurant logos (400x400px)
- **Image Upload**: Optimized for restaurant images (800x600px)
- **Document Upload**: For business licenses (supports PDF and images)

## Step 5: Folder Structure

Cloudinary will automatically create the following folder structure in your account:

```
grubgate/
├── restaurants/
│   ├── logos/          # Restaurant logos
│   ├── images/         # Restaurant gallery images
│   └── documents/      # Business licenses and documents
```

## Step 6: Testing the Setup

1. Start your backend server:
```bash
npm run dev
```

2. Test the partner registration endpoint with file uploads:
```bash
# Use a tool like Postman or curl to test
POST http://localhost:5000/api/v1/auth/partner/otp/verify
Content-Type: multipart/form-data

# Include files in the request:
# - logo: Image file for restaurant logo
# - images: Multiple image files for restaurant gallery
# - businessLicense: PDF or image file for business license
```

## Step 7: File Upload Limits

Current upload limits (configured in `cloudinary.js`):

- **Logo**: 5MB max, images only
- **Restaurant Images**: 5MB max per image, up to 5 images
- **Business License**: 10MB max, supports PDF and images

## Step 8: Image Transformations

Uploaded images are automatically optimized:

- **Logos**: Resized to 400x400px, cropped to fill, auto quality
- **Restaurant Images**: Resized to 800x600px, cropped to fill, auto quality
- **Documents**: No transformation, stored as-is

## Troubleshooting

### Common Issues:

1. **"Invalid API credentials"**
   - Double-check your environment variables
   - Ensure no extra spaces in the values
   - Restart your server after updating .env

2. **"Upload failed"**
   - Check file size limits
   - Verify file format is supported
   - Check your Cloudinary account quota

3. **"Folder not found"**
   - Folders are created automatically on first upload
   - No manual setup required

### Debug Mode

To enable debug logging, add this to your environment:

```env
CLOUDINARY_DEBUG=true
```

## Security Best Practices

1. **Never commit your .env file** - Add it to `.gitignore`
2. **Use different Cloudinary accounts** for development and production
3. **Set up upload presets** in Cloudinary dashboard for additional security
4. **Monitor your usage** to avoid unexpected charges

## Production Deployment

For production deployment:

1. Set up a separate Cloudinary account for production
2. Update environment variables on your hosting platform
3. Consider setting up **upload presets** for additional security
4. Monitor upload quotas and usage

## File URLs

After successful upload, files will be accessible via URLs like:

```
https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/grubgate/restaurants/logos/logo_restaurant_name_timestamp.jpg
```

These URLs are automatically stored in your MongoDB database and returned in API responses.

## Support

If you encounter issues:

1. Check the [Cloudinary Documentation](https://cloudinary.com/documentation)
2. Review the console logs for detailed error messages
3. Verify your account limits and quotas
4. Contact Cloudinary support if needed

---

**Note**: The free Cloudinary tier includes 25GB storage and 25GB monthly bandwidth, which should be sufficient for development and small-scale production use.
