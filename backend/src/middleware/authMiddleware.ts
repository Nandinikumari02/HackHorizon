import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 1. Authenticate Middleware (Used in Analyze Route)
export const authenticate = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    
    // ✅ FIX: Prisma ko 'id' chahiye. Hum manually ensure kar rahe hain ki 'id' field set ho.
    req.user = {
      ...decoded,
      id: decoded.id || decoded.userId || decoded.sub 
    };

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

// 2. Role Check Middleware
export const checkRole = (roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    // Safety check: req.user exist karna chahiye
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access Denied" });
    }
    next();
  };
};

// 3. Protect Middleware (Alternative/Backup)
export const protect = async (req: any, res: any, next: any) => {
  let token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Not authorized" });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    
    // ✅ Consistency: Isse bhi 'id' mapping ke sath update kar diya
    req.user = {
      ...decoded,
      id: decoded.id || decoded.userId || decoded.sub,
      role: decoded.role
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Token failed" });
  }
};