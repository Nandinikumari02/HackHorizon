import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// --- 1. CITIZEN REGISTRATION (Public) ---
export const registerCitizen = async (req: Request, res: Response) => {
  try {
    const { fullname, email, phoneNumber, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullname,
        email,
        phoneNumber,
        passwordHash,
        role: 'CITIZEN',
        citizen: { create: {} }
      }
    });
    res.status(201).json({ message: "Citizen registered successfully" });
  } catch (error) {
    res.status(400).json({ error: "Email or Phone already exists" });
  }
};

// --- 2. CREATE RECYCLING PARTNER OR WASTE STAFF (Protected) ---
export const createStaffOrPartner = async (req: any, res: Response) => {
  try {
    let { fullname, email, phoneNumber, password, role, organization, designation } = req.body;

    // RBAC: Logic for EcoSarthi Roles
    if (role === 'ADMIN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Only System Admins can create other Admins" });
    }

    if (req.user.role === 'RECYCLING_PARTNER') {
      if (role !== 'WASTE_STAFF') {
        return res.status(403).json({ error: "Recycling Partners can only create WASTE_STAFF" });
      }
      // Partner apne hi organization ka staff banayega
      const partnerProfile = await prisma.staff.findUnique({ where: { userId: req.user.id } });
      organization = partnerProfile?.organization;
    }

    // Duplicate Check
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phoneNumber }] }
    });
    if (existingUser) {
      return res.status(400).json({ error: "Email or Phone Number already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        fullname,
        email,
        phoneNumber,
        passwordHash,
        role,
        // Linking to Staff table if they are Partners or Pickup Boys
        ...((role === 'RECYCLING_PARTNER' || role === 'WASTE_STAFF') && {
          staff: {
            create: {
              organization: organization || "General",
              designation: designation || (role === 'WASTE_STAFF' ? "Pickup Staff" : "Center Lead")
            }
          }
        })
      },
      include: { staff: true }
    });

    res.status(201).json({
      message: `${role} created successfully`,
      user: { id: newUser.id, fullname: newUser.fullname, email: newUser.email, role: newUser.role }
    });

  } catch (error: any) {
    console.error("CREATE_USER_ERROR:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- 3. UNIVERSAL LOGIN (For Everyone) ---
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { citizen: true, staff: true } 
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Payload includes IDs for both User table and specific Role tables
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        citizenId: user.citizen?.id || null,
        staffId: user.staff?.id || null 
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        points: user.points
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

// --- 4. GET ME (Personal Profile Sync) ---
export const getMe = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullname: true,
        email: true,
        role: true,
        points: true,
        staff: {
          select: { organization: true, designation: true }
        },
        citizen: true
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// // --- 5. PASSWORD RESET LOGIC ---
// export const forgotPassword = async (req: Request, res: Response) => {
//   const { email } = req.body;
//   const user = await prisma.user.findUnique({ where: { email } });
  
//   if (!user) {
//     return res.status(200).json({ message: "If account exists, OTP sent." });
//   }

//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   const expires = new Date(Date.now() + 10 * 60 * 1000); 

//   await prisma.user.update({
//     where: { email },
//     data: { resetOtp: otp, resetOtpExpires: expires }
//   });

//   await sendOTPEmail(email, otp);
//   res.status(200).json({ message: "OTP sent successfully!" });
// };

// export const resetPassword = async (req: Request, res: Response) => {
//   const { email, otp, newPassword } = req.body;
//   const user = await prisma.user.findUnique({ where: { email } });

//   if (!user || user.resetOtp !== otp || new Date() > (user.resetOtpExpires || new Date(0))) {
//     return res.status(400).json({ message: "Invalid or expired OTP" });
//   }

//   const passwordHash = await bcrypt.hash(newPassword, 10);

//   await prisma.user.update({
//     where: { email },
//     data: { 
//       passwordHash,
//       resetOtp: null,        
//       resetOtpExpires: null 
//     }
//   });

//   res.status(200).json({ message: "Password reset successful!" });
// };