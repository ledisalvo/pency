import AWS from "aws-sdk";
import sharp from "sharp";

import {Quality} from "../types";

export default {
  optimize: (image: Buffer, quality: Quality = "low") => {
    switch (quality) {
      // Banners
      case "high": {
        return sharp(image).jpeg({quality: 20}).resize(1200, 630, {fit: "inside"}).toBuffer();
      }

      // Products
      case "low":
      default: {
        return sharp(image).jpeg({quality: 20}).resize(500, 500, {fit: "inside"}).toBuffer();
      }
    }
  },
  upload: async (file: Buffer, folder: string = "root"): Promise<string> => {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_IMAGES_ID,
      secretAccessKey: process.env.AWS_IMAGES_SECRET,
    });

    // Prepare params
    const params: AWS.S3.PutObjectRequest = {
      Bucket: process.env.AWS_IMAGES_BUCKET,
      Key: `${folder}/${+new Date()}.jpg`,
      Body: file,
      ACL: "public-read",
      ContentType: "image/jpeg",
      CacheControl: "public,max-age=31536000,immutable",
    };

    // Save to bucket
    return new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        // If something failed
        if (err) {
          // Reject promise
          return reject(err);
        }

        // Otherwise return url
        return resolve(data.Location);
      });
    });
  },
};
