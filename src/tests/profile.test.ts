import { createOrUpdateProfile } from '../controllers/profile.controller';
import {Profile} from '../modals/Profile';
import { Request, Response } from 'express';

const mockRequest = (sessionData:any, body:any) => ({
  session: { data: sessionData },
  body,
  user: { id: '123' },
} as unknown as Request);

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('createOrUpdateProfile', () => {
  it('should create a new profile if not exists', async () => {
    const req = mockRequest({}, { position: 'Developer', bio: 'Test Bio' });
    const res = mockResponse();
    Profile.findOne = jest.fn().mockResolvedValue(null);
    Profile.findOneAndUpdate = jest.fn();
    Profile.prototype.save = jest.fn().mockResolvedValue({
      _id: (req as any).user.id,
      position: 'Developer',
      bio: 'Test Bio',
    });

    await createOrUpdateProfile(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        bio: "Test Bio", position: "Developer"
    }));
  });

  it('should update an existing profile', async () => {
    const req = mockRequest({}, { position: 'Senior Developer', bio: 'Updated Bio' });
    const res = mockResponse();

    Profile.findOne = jest.fn().mockResolvedValue(true);
    Profile.findOneAndUpdate = jest.fn().mockResolvedValue({
      position: 'Senior Developer',
      bio: 'Updated Bio',
    });

    await createOrUpdateProfile(req, res);

    expect(Profile.findOneAndUpdate).toHaveBeenCalledWith(
        { user: (req as any).user.id }, // This matches the user ID from the request
        { 
          $set: { 
            position: 'Senior Developer', 
            bio: 'Updated Bio',
            user: (req as any).user.id, // Ensure this matches the actual implementation
          } 
        },
        { new: true },
      );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      position: 'Senior Developer',
      bio: 'Updated Bio',
    }));
  });
});