import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sequelize } from "../config/db.js";
import { DataTypes, Model } from "sequelize";

class User extends Model {
    async isPasswordCorrect(password) {
        return await bcrypt.compare(password, this.password);
    }

    async isOtpCorrect(otp) {
        if (!this.otp) return false;
        const isVerified = await bcrypt.compare(otp, this.otp);
        const isExpired = Date.now() < this.otp_expiry;
        return isVerified && isExpired;
    }

    generateAccessToken() {
        return jwt.sign(
            {
                id: this.id,
                username: this.username,
                email: this.email,
                fullname: this.fullname,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );
    }

    generateRefreshToken() {
        return jwt.sign(
            { id: this.id },
            process.env.REFERSH_TOKEN_SECRET,
            { expiresIn: process.env.REFERSH_TOKEN_EXPIRY }
        );
    }
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            set(value) {
                this.setDataValue("username", value.toLowerCase().trim());
            }
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            set(value) {
                this.setDataValue("email", value.toLowerCase().trim());
            }
        },
        
        fullname: {
            type: DataTypes.STRING,
            allowNull: false
        },

        avatar: {
            type: DataTypes.STRING,
            allowNull: false
        },

        coverimage: {
            type: DataTypes.STRING
        },

        refreshToken: {
            type: DataTypes.STRING
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        
        otp: {
            type: DataTypes.STRING
        },

        otp_expiry: {
            type: DataTypes.DATE
        },
    },
    {
        sequelize,
        modelName: "User",
        timestamps: true,
        hooks: {
            beforeSave: async (user) => {
                if (user.changed("password")) {
                    user.password = await bcrypt.hash(user.password, 10);
                }
                if (user.changed("otp") && user.otp) {
                    user.otp = await bcrypt.hash(user.otp, 10);
                }
            },
        },
    }
);

export default User;