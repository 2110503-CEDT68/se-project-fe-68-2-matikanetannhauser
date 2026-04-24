import mongoose, { Date } from "mongoose";
import NextAuth, { DefaultSession } from "next-auth";

export type UserType = {
    _id: string,
    name: string,
    sub: string,
    email: string,
    role: string,
    telephone: string,
}

export type ReservationType = {
    _id: mongoose.Types.ObjectId
    startDateTime: Date
    endDateTime: Date
    user: string
    restaurant: string
}

export type RestaurantType = {
    _id: mongoose.Types.ObjectId
    imgsrc: string,
    name: string,
    address: string,
    comments: CommentType[],
    telephone:string,
    openTime: string,
    closeTime: string,
}

export type CommentType = {
    _id: mongoose.Types.ObjectId
    text: string,
    rating: number,
    restaurant: ReservationType,
    user: UserType,
    createdAt: Date,
    updatedAt: Date,
}

declare module "next-auth" {
  interface Session {
    user: {
      role: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
  }
}