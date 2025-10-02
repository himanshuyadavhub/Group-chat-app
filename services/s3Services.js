const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require("dotenv").config
const AWS_REGION = process.env.AWS_REGION;
const IAM_ACCESS_KEY = process.env.IAM_ACCESS_KEY;
const IAM_SECRET_KEY = process.env.IAM_SECRET_KEY;
const BUCKET_NAME = process.env.BUCKET_NAME;


const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: IAM_ACCESS_KEY,
        secretAccessKey: IAM_SECRET_KEY
    }
});

async function getUploadUrl(fileName, contentType){
    const command= new PutObjectCommand({
        Bucket:BUCKET_NAME,
        Key:fileName,
        ContentType:contentType,
        ACL: "public-read"
    })
    const uploadUrl= await getSignedUrl(s3Client, command, {expiresIn:60});
    const fileUrl= `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
    return {uploadUrl, fileUrl}
}

module.exports = {
    getUploadUrl
}