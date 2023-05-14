import cloudinary from "cloudinary";

const cloudinaryModul = cloudinary.v2;

cloudinaryModul.config({
    cloud_name: "saimun",
    api_key: "557893492874456",
    api_secret: "sD-TxY6HS4iurHmJ3rHerT-CZr8"
})


export default cloudinaryModul;