import { jwt } from "@deps";
import { jwtTokenKey } from "@lib";
import { user } from "@app";

export interface ServerSession {
  user?: {
    id: string;
    _id: string;
    national_number?: string;
    mobile?: string;
    level?: string;
  };
}

export const getServerSession = async (token: string): Promise<ServerSession | null> => {
  if (!token) {
    return null;
  }

  try {
    // Verify and decode the JWT token
    const payload = await jwt.verify(token, jwtTokenKey);

    if (!payload || !payload._id) {
      return null;
    }

    // Get user details from database
    const userData = await user.findOne({
      filters: { _id: payload._id },
      projection: {
        _id: 1,
        national_number: 1,
        mobile: 1,
        level: 1,
        is_active: 1,
      }
    });

    if (!userData || !userData.is_active) {
      return null;
    }

    return {
      user: {
        id: userData._id.toString(),
        _id: userData._id.toString(),
        national_number: userData.national_number,
        mobile: userData.mobile,
        level: userData.level,
      }
    };
  } catch (error) {
    // Token is invalid or expired
    console.error("Token verification failed:", error);
    return null;
  }
};
