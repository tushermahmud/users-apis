import { isAdminRequest, sameUser } from "../helpers/helper";
import { User } from "../modals/User";
import mongoose from "mongoose";
describe("Testing helper functions",()=>{
    it("should return true if the user is the same",()=>{
        const user = {
            _id: "123",
            email: "test@example.com",
        }
        const req = {
            user: {
                _id: "123",
                email: "test@example.com",
            }
        }
        const result = sameUser(user._id, req.user._id);
        expect(result).toBe(true);
    })
    it("should return false if the user is not the same",()=>{
        const user = {
            _id: "123",
            email: "test@example.com",
        }
        const req = {
            user: {
                _id: "456",
                email: "test2@example.com",
            }
        }
        const result = sameUser(user._id, req.user._id);
        expect(result).toBe(false);
    })
    it("Check if is admin", ()=>{
        const user = {
            role: "admin",
            email: "test@example.com",
            password: "123456",
            username: "test",
            resetPasswordLink: "",
            _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011")
        } as unknown as InstanceType<typeof User>;
        const result = isAdminRequest(user);
        expect(result).toBe(true); 
    })
    it("Check if is not admin", ()=>{
        const user = {
            role: "user",
            email: "test@example.com",
            password: "123456",
            username: "test",
            resetPasswordLink: "",
            _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011")
        } as unknown as InstanceType<typeof User>;
        const result = isAdminRequest(user);
        expect(result).toBe(false); 
    })
})

