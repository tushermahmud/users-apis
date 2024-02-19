import {User} from "../modals/User";

export const sameUser = (loggedInUserId: string, requestUserId: string) => {
  return loggedInUserId === requestUserId;
};

export const isAdminRequest = (user: InstanceType<typeof User>) => {
  return user.role === "admin";
};
