import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

const prisma = new PrismaClient();

export const registerUser = async (userData: any) => {
  const { email, password, fullname, phoneNumber, role, organization, designation } = userData;

  const hashedPassword = await hashPassword(password);

  return await prisma.$transaction(async (tx) => {
    // 1. Create Base User
    const user = await tx.user.create({
      data: {
        email,
        fullname,
        phoneNumber,
        role, // CITIZEN, RECYCLING_PARTNER, WASTE_STAFF, or ADMIN
        passwordHash: hashedPassword,
      },
    });

    let citizenId = null;
    let staffId = null;

    // 2. Role-Specific Profile Creation
    if (role === 'CITIZEN') {
      const citizen = await tx.citizen.create({ data: { userId: user.id } });
      citizenId = citizen.id;
    } 
    else if (role === 'RECYCLING_PARTNER' || role === 'WASTE_STAFF') {
      const staff = await tx.staff.create({
        data: {
          userId: user.id,
          organization: organization || "EcoSarthi Central", 
          designation: designation || (role === 'WASTE_STAFF' ? "Pickup Staff" : "Center Manager"), 
        },
      });
      staffId = staff.id;
    }

    // 3. Token mein IDs embed karna zaroori hai controllers ke liye
    const token = generateToken({ 
        id: user.id, 
        role: user.role, 
        citizenId, 
        staffId 
    });

    return { user, token };
  });
};

export const loginUser = async (email: string, pass: string) => {
  const user = await prisma.user.findUnique({ 
    where: { email },
    include: {
        citizen: { select: { id: true } },
        staff: { select: { id: true } }
    }
  });
  
  if (!user || !(await comparePassword(pass, user.passwordHash))) {
    throw new Error('Invalid credentials');
  }
  
  // EcoSarthi Token Payload: Controllers ko yahi IDs chahiye
  const token = generateToken({ 
      id: user.id, 
      role: user.role,
      citizenId: user.citizen?.id || null,
      staffId: user.staff?.id || null 
  });

  return { 
    user: {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
        points: user.points
    }, 
    token 
  };
};