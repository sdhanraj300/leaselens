import { Response, Router } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/user - Get or creat e user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    
    let dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: { 
          id: user.id, 
          email: user.email!, 
          credits: 1,
          city: user.user_metadata?.city || "london"
        }
      });
    }
    return res.json(dbUser);
  } catch (error) {
    console.error("User API Error:", error);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
});

// PATCH /api/user/city - Update user's city
router.patch('/city', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { city } = req.body;

    if (!city) {
      return res.status(400).json({ error: "City is required" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { city: city.toLowerCase() }
    });

    return res.json(updatedUser);
  } catch (error) {
    console.error("Update City API Error:", error);
    return res.status(500).json({ error: "Failed to update city" });
  }
});

export default router;
