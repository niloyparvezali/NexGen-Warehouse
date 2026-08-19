import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { generateAccessToken } from "../utils/jwt.js";

export async function loginUser(email, password) {
  const normEmail = typeof email === 'string' ? email.trim() : email;
  const normPassword = typeof password === 'string' ? password.trim() : password;

  // Temporary bypass for local/testing login: allow only the seeded admin@nexgen.local account
  if (normEmail.toLowerCase() === "admin@nexgen.local" && normPassword === "Admin@123") {
    let user = await prisma.user.findUnique({
      where: { email: "admin@nexgen.local" },
      include: {
        role: true,
      },
    });

    if (!user) {
      const adminRole = await prisma.role.findUnique({
        where: { name: "Administrator" },
      });

      if (!adminRole) {
        throw new Error("Administrator role not found. Please seed roles before logging in.");
      }

      const hashedPassword = await bcrypt.hash("Admin@123", 10);
      user = await prisma.user.create({
        data: {
          first_name: "System",
          last_name: "Administrator",
          username: "admin",
          email: "admin@nexgen.local",
          password: hashedPassword,
          role_id: adminRole.id,
          is_active: true,
        },
        include: {
          role: true,
        },
      });
    }

    console.log('🔒 Dev auth bypass used for admin@nexgen.local id=', user.id);
    const token = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role.name,
    });

    return {
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permissions ?? {},
        rolePermissions: user.role.permissions ?? {},
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: true,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  if (!user.is_active) {
    throw new Error("Your account has been deactivated.");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error("Invalid email or password.");
  }

  const token = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role.name,
  });

  return {
    token,
    user: {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions ?? {},
      rolePermissions: user.role.permissions ?? {},
    },
  };
}
